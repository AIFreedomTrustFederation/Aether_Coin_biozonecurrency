import { pgClient } from "../server/db";
import bcrypt from "bcryptjs";

async function main() {
  try {
    console.log("Adding AI Freedom Trust user...");
    
    // Hash the password
    const passwordHash = await bcrypt.hash('FreedomLiberty2021', 10);

    try {
      // First try to update existing user
      console.log("Checking if user exists and updating...");
      
      const updateResult = await pgClient`
        UPDATE users 
        SET password_hash = ${passwordHash}, 
            email = ${'admin@aifreedom.trust'}, 
            role = ${'admin'}, 
            is_trust_member = ${true}, 
            trust_member_level = ${'governing'} 
        WHERE username = ${'aifreedomtrust'}
        RETURNING id
      `;
      
      if (updateResult.length > 0) {
        console.log("AI Freedom Trust user updated successfully");
        return;
      }
    } catch (updateError) {
      console.log("User doesn't exist yet, will create.");
    }
    
    try {
      console.log("Creating new AI Freedom Trust user...");
      
      // Create new user without specifying ID (let DB auto-increment)
      const insertResult = await pgClient`
        INSERT INTO users (
          username, 
          email, 
          password_hash, 
          role, 
          is_trust_member, 
          trust_member_since, 
          trust_member_level, 
          is_active
        ) 
        VALUES (
          ${'aifreedomtrust'}, 
          ${'admin@aifreedom.trust'}, 
          ${passwordHash}, 
          ${'admin'}, 
          ${true}, 
          ${new Date().toISOString()}, 
          ${'governing'}, 
          ${true}
        ) 
        RETURNING id
      `;
      
      if (insertResult.length > 0) {
        console.log(`Created AI Freedom Trust admin user with ID: ${insertResult[0].id}`);
      }
    } catch (insertError) {
      // If there's an error with the insert (like duplicate username)
      console.error("Error creating user:", insertError.message);
      
      // Maybe this already exists but has a different username field
      console.log("Attempting to check if user exists with this email...");
      
      try {
        const existingUser = await pgClient`
          SELECT id, username FROM users WHERE email = ${'admin@aifreedom.trust'}
        `;
        
        if (existingUser.length > 0) {
          console.log(`Found existing user with ID ${existingUser[0].id} and username ${existingUser[0].username}. Will update.`);
          
          // Update the existing user found by email
          await pgClient`
            UPDATE users 
            SET username = ${'aifreedomtrust'},
                password_hash = ${passwordHash},
                role = ${'admin'}, 
                is_trust_member = ${true}, 
                trust_member_level = ${'governing'} 
            WHERE email = ${'admin@aifreedom.trust'}
          `;
          
          console.log("AI Freedom Trust user updated successfully via email");
        }
      } catch (secondaryError) {
        console.error("Additional error when checking by email:", secondaryError);
      }
    }
    
    console.log("Script completed successfully");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

main().catch(console.error);