"use strict";
/**
 * Code Generator Service
 * This service is responsible for generating smart contract code from NLP-processed requirements,
 * as well as tests, API interfaces, and frontend components.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeGenerator = exports.CodeGenerator = void 0;
const storage_1 = require("../../storage");
const nlp_processor_1 = require("./nlp-processor");
const schema_manager_1 = require("../schema-system/schema-manager");
const dapp_schema_1 = require("../../../shared/dapp-schema");
const drizzle_orm_1 = require("drizzle-orm");
const nlpProcessor = new nlp_processor_1.NlpProcessor();
const schemaManager = new schema_manager_1.SchemaManager();
class CodeGenerator {
    /**
     * Generate a smart contract from natural language input
     * @param userId User ID
     * @param prompt Natural language description
     * @param options Generation options
     * @returns Generated code and associated files
     */
    async generateFromPrompt(userId, prompt, options) {
        try {
            // First, process the natural language input to extract requirements
            const requirements = await nlpProcessor.processInput(prompt);
            // Save this conversation
            await nlpProcessor.saveConversation(userId, prompt, 'user', requirements.intent, requirements.entities);
            let result;
            // If a template was suggested, use it as a starting point
            if (requirements.suggestedTemplate) {
                // Find the template in the database
                const template = await storage_1.db.query.dappTemplates.findFirst({
                    where: (0, drizzle_orm_1.eq)(storage_1.db.query.dappTemplates.name, requirements.suggestedTemplate)
                });
                if (template) {
                    // Generate from template
                    result = await this.generateFromTemplate(template.id, requirements, options);
                    // Notify the user about the template used
                    await nlpProcessor.saveConversation(userId, `I've used the ${requirements.suggestedTemplate} template as a starting point. This template is designed for ${template.description}.`, 'mysterion');
                }
                else {
                    // If template not found in db, generate custom code
                    result = await this.generateCustomCode(requirements, options);
                    // Notify the user
                    await nlpProcessor.saveConversation(userId, `I couldn't find the suggested template, so I've created a custom implementation based on your requirements.`, 'mysterion');
                }
            }
            else {
                // No template suggested, generate custom code
                result = await this.generateCustomCode(requirements, options);
                // Notify the user
                await nlpProcessor.saveConversation(userId, `I've created a custom implementation based on your requirements.`, 'mysterion');
            }
            return result;
        }
        catch (error) {
            console.error('Error generating code from prompt:', error);
            throw error;
        }
    }
    /**
     * Generate code from a template
     * @param templateId Template ID
     * @param requirements Processed requirements
     * @param options Generation options
     * @returns Generated code and associated files
     */
    async generateFromTemplate(templateId, requirements, options) {
        try {
            // Get the template
            const template = await storage_1.db.query.dappTemplates.findFirst({
                where: (0, drizzle_orm_1.eq)(storage_1.db.query.dappTemplates.id, templateId)
            });
            if (!template) {
                throw new Error(`Template with ID ${templateId} not found`);
            }
            // Get the schema based on the template
            const schema = await schemaManager.getSchemaById(template.schemaId);
            if (!schema) {
                throw new Error(`Schema with ID ${template.schemaId} not found`);
            }
            // Extract parameters from requirements
            const parameters = this.extractParametersFromRequirements(requirements, template.parameters);
            // Format the contract name
            const contractName = parameters.contractName ||
                this.formatContractName(requirements.entities[0]?.name || requirements.intent);
            parameters.contractName = contractName;
            // Apply parameters to the template
            const generatedCode = await schemaManager.applyParameters(template.schemaId, parameters);
            if (!generatedCode) {
                throw new Error('Failed to generate code from template');
            }
            const result = {
                contractCode: generatedCode.code
            };
            // Include test code if requested
            if (options.includeTests && generatedCode.testCode) {
                result.testCode = generatedCode.testCode;
            }
            // Include UI code if requested
            if (options.includeFrontend && generatedCode.uiCode) {
                result.uiCode = generatedCode.uiCode;
            }
            // Generate documentation if requested
            if (options.includeDocumentation) {
                result.docs = await schemaManager.generateDocumentation(template.schemaId, parameters);
            }
            // Perform security checks if requested
            if (options.securityChecks) {
                result.securityReport = await this.performSecurityChecks(generatedCode.code);
            }
            return result;
        }
        catch (error) {
            console.error('Error generating code from template:', error);
            throw error;
        }
    }
    /**
     * Extract parameters from NLP requirements to use with templates
     * @param requirements Processed requirements
     * @param templateParams Template parameters definition
     * @returns Parameters object
     */
    extractParametersFromRequirements(requirements, templateParams) {
        // Initialize with default values
        const params = {};
        // For each parameter in the template
        templateParams.forEach((param) => {
            // Initialize with default if provided
            if (param.default !== undefined) {
                params[param.name] = param.default;
            }
            // Try to extract from entities
            if (param.name === 'contractName') {
                // Extract contract name from the first entity or intent
                const contractName = requirements.entities[0]?.name ||
                    this.formatContractName(requirements.intent);
                params[param.name] = contractName;
            }
            else if (param.name === 'tokenSymbol' && requirements.intent === 'TokenCreation') {
                // Extract token symbol from the first token entity
                const tokenEntity = requirements.entities.find((e) => e.entityType === 'Token');
                if (tokenEntity) {
                    params[param.name] = tokenEntity.name.substring(0, 4).toUpperCase();
                }
                else {
                    params[param.name] = 'TKN';
                }
            }
            else if (param.name === 'tokenName' && requirements.intent === 'TokenCreation') {
                // Extract token name from the first token entity
                const tokenEntity = requirements.entities.find((e) => e.entityType === 'Token');
                if (tokenEntity) {
                    params[param.name] = tokenEntity.name;
                }
                else {
                    params[param.name] = 'MyToken';
                }
            }
            else if (param.name === 'totalSupply' && requirements.intent === 'TokenCreation') {
                // Default total supply
                params[param.name] = '1000000';
            }
            else if (param.name === 'ownerAddress') {
                // Default owner address
                params[param.name] = '0x0000000000000000000000000000000000000000';
            }
            else if (param.name === 'isPausable') {
                // Check if pausable was mentioned in constraints
                params[param.name] = requirements.constraints.some((c) => c.toLowerCase().includes('pause'));
            }
            else if (param.name === 'isUpgradeable') {
                // Check if upgradeable was mentioned in constraints
                params[param.name] = requirements.constraints.some((c) => c.toLowerCase().includes('upgrade'));
            }
        });
        return params;
    }
    /**
     * Format a name into a proper contract name (PascalCase)
     * @param name Raw name
     * @returns Formatted contract name
     */
    formatContractName(name) {
        // Split by non-alphanumeric characters
        const words = name.split(/[^a-zA-Z0-9]/).filter(w => w.length > 0);
        // Convert to PascalCase
        return words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }
    /**
     * Generate custom code from scratch
     * @param requirements Processed requirements
     * @param options Generation options
     * @returns Generated code and associated files
     */
    async generateCustomCode(requirements, options) {
        // In a real implementation, this would use an LLM to generate custom code
        // For the prototype, we'll use simple templates based on intent
        let contractCode = '';
        let contractName = this.formatContractName(requirements.entities[0]?.name || requirements.intent);
        // Generate basic contract structure based on intent
        switch (requirements.intent) {
            case 'TokenCreation':
                contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ${contractName} is ERC20, Ownable {
    constructor() ERC20("${contractName}", "${contractName.substring(0, 4).toUpperCase()}") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}`;
                break;
            case 'NFTCreation':
                contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ${contractName} is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("${contractName}", "${contractName.substring(0, 4).toUpperCase()}") {}

    function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}`;
                break;
            case 'Marketplace':
                contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ${contractName} is ReentrancyGuard, Ownable {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }
    
    // Listing ID => Listing data
    mapping(uint256 => Listing) public listings;
    uint256 private _listingIds;
    
    // Platform fee percentage (in basis points, 100 = 1%)
    uint256 public feePercentage = 250; // 2.5% default
    
    event ItemListed(uint256 listingId, address seller, address nftContract, uint256 tokenId, uint256 price);
    event ItemSold(uint256 listingId, address buyer, uint256 price);
    event ListingCancelled(uint256 listingId);
    
    function listItem(address nftContract, uint256 tokenId, uint256 price) external returns (uint256) {
        require(price > 0, "Price must be greater than zero");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(nft.isApprovedForAll(msg.sender, address(this)), "Contract not approved");
        
        _listingIds++;
        uint256 listingId = _listingIds;
        
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });
        
        emit ItemListed(listingId, msg.sender, nftContract, tokenId, price);
        return listingId;
    }
    
    function buyItem(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        
        listing.active = false;
        
        // Calculate fees
        uint256 fee = (listing.price * feePercentage) / 10000;
        uint256 sellerProceeds = listing.price - fee;
        
        // Transfer NFT to buyer
        IERC721(listing.nftContract).transferFrom(listing.seller, msg.sender, listing.tokenId);
        
        // Pay seller
        (bool success, ) = listing.seller.call{value: sellerProceeds}("");
        require(success, "Failed to pay seller");
        
        emit ItemSold(listingId, msg.sender, listing.price);
    }
    
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");
        
        listing.active = false;
        
        emit ListingCancelled(listingId);
    }
    
    function setFeePercentage(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee too high"); // Max 10%
        feePercentage = newFeePercentage;
    }
    
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Failed to withdraw fees");
    }
}`;
                break;
            case 'Governance':
                contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ${contractName} is Ownable {
    struct Proposal {
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startBlock;
        uint256 endBlock;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    IERC20 public governanceToken;
    uint256 public proposalCount;
    uint256 public votingPeriod = 10000; // blocks
    
    // Proposal ID => Proposal
    mapping(uint256 => Proposal) public proposals;
    
    event ProposalCreated(uint256 proposalId, string description, uint256 startBlock, uint256 endBlock);
    event VoteCast(address voter, uint256 proposalId, bool support, uint256 weight);
    event ProposalExecuted(uint256 proposalId);
    
    constructor(address _governanceToken) {
        governanceToken = IERC20(_governanceToken);
    }
    
    function propose(string memory description) external returns (uint256) {
        require(governanceToken.balanceOf(msg.sender) > 0, "No governance tokens");
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.description = description;
        proposal.startBlock = block.number;
        proposal.endBlock = block.number + votingPeriod;
        
        emit ProposalCreated(proposalId, description, proposal.startBlock, proposal.endBlock);
        return proposalId;
    }
    
    function castVote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.number >= proposal.startBlock, "Voting not started");
        require(block.number <= proposal.endBlock, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        
        emit VoteCast(msg.sender, proposalId, support, weight);
    }
    
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.number > proposal.endBlock, "Voting still in progress");
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        
        proposal.executed = true;
        
        // In a real implementation, this would actually execute the proposal
        // For this example, we just mark it as executed
        
        emit ProposalExecuted(proposalId);
    }
    
    function setVotingPeriod(uint256 newVotingPeriod) external onlyOwner {
        votingPeriod = newVotingPeriod;
    }
}`;
                break;
            default:
                contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ${contractName} is Ownable {
    // Contract state variables
    
    // Events
    
    constructor() {
        // Initialization
    }
    
    // Contract functions
}`;
        }
        const result = {
            contractCode
        };
        // Generate tests if requested
        if (options.includeTests) {
            result.testCode = this.generateBasicTests(contractName, requirements);
        }
        // Generate UI code if requested
        if (options.includeFrontend) {
            result.uiCode = this.generateBasicUI(contractName, requirements);
        }
        // Generate documentation if requested
        if (options.includeDocumentation) {
            result.docs = this.generateDocumentation(contractName, requirements);
        }
        // Perform security checks if requested
        if (options.securityChecks) {
            result.securityReport = await this.performSecurityChecks(contractCode);
        }
        return result;
    }
    /**
     * Generate basic test code for a contract
     * @param contractName Contract name
     * @param requirements Requirements analysis
     * @returns Test code
     */
    generateBasicTests(contractName, requirements) {
        // Generate basic test code based on intent
        switch (requirements.intent) {
            case 'TokenCreation':
                return `const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("${contractName}", function () {
  let token;
  let owner;
  let addr1;
  let addr2;
  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("${contractName}");
    token = await Token.deploy();
    await token.deployed();
  });
  
  it("Should assign the total supply of tokens to the owner", async function () {
    const ownerBalance = await token.balanceOf(owner.address);
    expect(await token.totalSupply()).to.equal(ownerBalance);
  });
  
  it("Should allow owner to mint tokens", async function () {
    const initialSupply = await token.totalSupply();
    await token.mint(addr1.address, 100);
    expect(await token.balanceOf(addr1.address)).to.equal(100);
    expect(await token.totalSupply()).to.equal(initialSupply.add(100));
  });
  
  it("Should fail if non-owner tries to mint tokens", async function () {
    await expect(
      token.connect(addr1).mint(addr2.address, 100)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
  
  it("Should allow transfers between accounts", async function () {
    await token.mint(addr1.address, 100);
    await token.connect(addr1).transfer(addr2.address, 50);
    expect(await token.balanceOf(addr1.address)).to.equal(50);
    expect(await token.balanceOf(addr2.address)).to.equal(50);
  });
});`;
            case 'NFTCreation':
                return `const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("${contractName}", function () {
  let nft;
  let owner;
  let addr1;
  let addr2;
  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const NFT = await ethers.getContractFactory("${contractName}");
    nft = await NFT.deploy();
    await nft.deployed();
  });
  
  it("Should mint a new NFT", async function () {
    const tokenURI = "https://example.com/token/1";
    await nft.mintNFT(addr1.address, tokenURI);
    
    expect(await nft.ownerOf(1)).to.equal(addr1.address);
    expect(await nft.tokenURI(1)).to.equal(tokenURI);
  });
  
  it("Should fail if non-owner tries to mint NFT", async function () {
    await expect(
      nft.connect(addr1).mintNFT(addr2.address, "https://example.com/token/2")
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
  
  it("Should allow token transfers", async function () {
    const tokenURI = "https://example.com/token/1";
    await nft.mintNFT(addr1.address, tokenURI);
    
    await nft.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
    expect(await nft.ownerOf(1)).to.equal(addr2.address);
  });
});`;
            default:
                return `const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("${contractName}", function () {
  let contract;
  let owner;
  let addr1;
  let addr2;
  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const Contract = await ethers.getContractFactory("${contractName}");
    contract = await Contract.deploy();
    await contract.deployed();
  });
  
  it("Should deploy successfully", async function () {
    expect(contract.address).to.be.properAddress;
  });
  
  // Add more tests here based on your contract's functionality
});`;
        }
    }
    /**
     * Generate basic UI code for a contract
     * @param contractName Contract name
     * @param requirements Requirements analysis
     * @returns UI code (React component)
     */
    generateBasicUI(contractName, requirements) {
        // Generate basic React component based on intent
        switch (requirements.intent) {
            case 'TokenCreation':
                return `import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ${contractName}Artifact from '../artifacts/contracts/${contractName}.sol/${contractName}.json';

const ${contractName}UI = ({ contractAddress }) => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [totalSupply, setTotalSupply] = useState('0');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [mintTo, setMintTo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, ${contractName}Artifact.abi, signer);
        
        setAccount(accounts[0]);
        setContract(tokenContract);
        
        const decimals = await tokenContract.decimals();
        const totalSupplyBN = await tokenContract.totalSupply();
        setTotalSupply(ethers.utils.formatUnits(totalSupplyBN, decimals));
        
        const balanceBN = await tokenContract.balanceOf(accounts[0]);
        setBalance(ethers.utils.formatUnits(balanceBN, decimals));
        
        window.ethereum.on('accountsChanged', (newAccounts) => {
          setAccount(newAccounts[0]);
        });
      }
    };
    
    init();
  }, [contractAddress]);
  
  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!contract) return;
    
    try {
      setLoading(true);
      const decimals = await contract.decimals();
      const amount = ethers.utils.parseUnits(transferAmount, decimals);
      const tx = await contract.transfer(transferTo, amount);
      await tx.wait();
      
      const balanceBN = await contract.balanceOf(account);
      setBalance(ethers.utils.formatUnits(balanceBN, decimals));
      
      setTransferAmount('');
      setTransferTo('');
    } catch (error) {
      console.error('Transfer error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMint = async (e) => {
    e.preventDefault();
    if (!contract) return;
    
    try {
      setLoading(true);
      const decimals = await contract.decimals();
      const amount = ethers.utils.parseUnits(mintAmount, decimals);
      const tx = await contract.mint(mintTo, amount);
      await tx.wait();
      
      const totalSupplyBN = await contract.totalSupply();
      setTotalSupply(ethers.utils.formatUnits(totalSupplyBN, decimals));
      
      setMintAmount('');
      setMintTo('');
    } catch (error) {
      console.error('Mint error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">${contractName} Interface</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Token Info</h2>
        <p><strong>Connected Account:</strong> {account}</p>
        <p><strong>Your Balance:</strong> {balance} tokens</p>
        <p><strong>Total Supply:</strong> {totalSupply} tokens</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Transfer Tokens</h2>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block mb-1">Recipient Address:</label>
            <input
              type="text"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="0x..."
              required
            />
          </div>
          <div>
            <label className="block mb-1">Amount:</label>
            <input
              type="text"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="0.0"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Processing...' : 'Transfer'}
          </button>
        </form>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Mint Tokens (Owner Only)</h2>
        <form onSubmit={handleMint} className="space-y-4">
          <div>
            <label className="block mb-1">Recipient Address:</label>
            <input
              type="text"
              value={mintTo}
              onChange={(e) => setMintTo(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="0x..."
              required
            />
          </div>
          <div>
            <label className="block mb-1">Amount:</label>
            <input
              type="text"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="0.0"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
          >
            {loading ? 'Processing...' : 'Mint'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ${contractName}UI;`;
            case 'NFTCreation':
                return `import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ${contractName}Artifact from '../artifacts/contracts/${contractName}.sol/${contractName}.json';

const ${contractName}UI = ({ contractAddress }) => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [mintToAddress, setMintToAddress] = useState('');
  const [tokenURI, setTokenURI] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, ${contractName}Artifact.abi, signer);
        
        setAccount(accounts[0]);
        setContract(nftContract);
        
        // Check if connected account is the owner
        const ownerAddress = await nftContract.owner();
        setIsOwner(ownerAddress.toLowerCase() === accounts[0].toLowerCase());
        
        // This is a simplified approach; in a real app, you would need to query events
        // or use a subgraph to get owned tokens efficiently
        
        window.ethereum.on('accountsChanged', (newAccounts) => {
          setAccount(newAccounts[0]);
        });
      }
    };
    
    init();
  }, [contractAddress]);
  
  const handleMint = async (e) => {
    e.preventDefault();
    if (!contract) return;
    
    try {
      setLoading(true);
      const tx = await contract.mintNFT(mintToAddress, tokenURI);
      await tx.wait();
      
      setMintToAddress('');
      setTokenURI('');
    } catch (error) {
      console.error('Mint error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">${contractName} Interface</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Account Info</h2>
        <p><strong>Connected Account:</strong> {account}</p>
        <p><strong>Owner Rights:</strong> {isOwner ? 'Yes (Can Mint)' : 'No'}</p>
      </div>
      
      {isOwner && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Mint New NFT</h2>
          <form onSubmit={handleMint} className="space-y-4">
            <div>
              <label className="block mb-1">Recipient Address:</label>
              <input
                type="text"
                value={mintToAddress}
                onChange={(e) => setMintToAddress(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="0x..."
                required
              />
            </div>
            <div>
              <label className="block mb-1">Token URI:</label>
              <input
                type="text"
                value={tokenURI}
                onChange={(e) => setTokenURI(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="https://example.com/metadata/1"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {loading ? 'Processing...' : 'Mint NFT'}
            </button>
          </form>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your NFTs</h2>
        {ownedTokens.length === 0 ? (
          <p>No NFTs found for this account</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownedTokens.map((token) => (
              <div key={token.id} className="border rounded p-4">
                <p><strong>Token ID:</strong> {token.id}</p>
                <p><strong>URI:</strong> {token.uri}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ${contractName}UI;`;
            default:
                return `import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ${contractName}Artifact from '../artifacts/contracts/${contractName}.sol/${contractName}.json';

const ${contractName}UI = ({ contractAddress }) => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, ${contractName}Artifact.abi, signer);
        
        setAccount(accounts[0]);
        setContract(contractInstance);
        
        try {
          const ownerAddress = await contractInstance.owner();
          setIsOwner(ownerAddress.toLowerCase() === accounts[0].toLowerCase());
        } catch (error) {
          console.log('Contract might not have an owner function');
        }
        
        window.ethereum.on('accountsChanged', (newAccounts) => {
          setAccount(newAccounts[0]);
        });
      }
    };
    
    init();
  }, [contractAddress]);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">${contractName} Interface</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Account Info</h2>
        <p><strong>Connected Account:</strong> {account}</p>
        <p><strong>Owner Rights:</strong> {isOwner ? 'Yes' : 'No'}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Contract Info</h2>
        <p><strong>Contract Address:</strong> {contractAddress}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Contract Interactions</h2>
        <p>Implement contract-specific interactions here based on your ABI and functionality.</p>
      </div>
    </div>
  );
};

export default ${contractName}UI;`;
        }
    }
    /**
     * Generate documentation for a contract
     * @param contractName Contract name
     * @param requirements Requirements analysis
     * @param parameters Template parameters (if any)
     * @returns Documentation in markdown format
     */
    generateDocumentation(contractName, requirements, parameters) {
        // Build basic documentation
        let docs = `# ${contractName}

## Overview
A smart contract generated based on the intent: ${requirements.intent}.

## Requirements Analysis
- **Intent**: ${requirements.intent}
- **Confidence**: ${requirements.confidence}
- **Complexity**: ${requirements.complexity}
${requirements.tokenStandard ? `- **Token Standard**: ${requirements.tokenStandard}` : ''}

## Entities
${requirements.entities.map((entity) => `### ${entity.name} (${entity.entityType})
- **Properties**: ${entity.properties.join(', ')}
- **Relationships**: ${entity.relationships.length > 0
            ? entity.relationships.map((rel) => `${rel.relation} ${rel.entity}`).join(', ')
            : 'None'}`).join('\n\n')}

## Actions
${requirements.actions.map((action) => `- ${action}`).join('\n')}

## Constraints
${requirements.constraints.length > 0
            ? requirements.constraints.map((constraint) => `- ${constraint}`).join('\n')
            : '- No specific constraints identified'}

## Integration Guide

### Prerequisites
- Solidity ^0.8.0
- OpenZeppelin Contracts

### Deployment
To deploy this contract, you need:
1. A development environment with Hardhat or Truffle
2. OpenZeppelin Contracts installed
3. Ethereum wallet with ETH for gas

\`\`\`bash
# Install dependencies
npm install @openzeppelin/contracts

# Compile the contract
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deploy.js --network goerli
\`\`\`

### Sample Deployment Script

\`\`\`javascript
// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const Contract = await ethers.getContractFactory("${contractName}");
  const contract = await Contract.deploy();
  
  await contract.deployed();
  
  console.log("${contractName} deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
\`\`\`

## Security Considerations
- Always perform a thorough audit before deploying to mainnet
- Consider using formal verification
- Implement proper access control
- Consider adding emergency pause functionality
- Test thoroughly with different scenarios

## License
This contract uses the MIT License.`;
        return docs;
    }
    /**
     * Perform basic security checks on contract code
     * @param code Solidity code
     * @returns Security report
     */
    async performSecurityChecks(code) {
        // In a real implementation, this would use a more sophisticated security analysis
        // For the prototype, we'll do some basic pattern matching
        const issues = [];
        // Check for reentrancy vulnerabilities
        if (code.includes('transfer(') && !code.includes('ReentrancyGuard') && !code.includes('nonReentrant')) {
            issues.push({
                severity: 'high',
                description: 'Potential reentrancy vulnerability: using transfer without ReentrancyGuard',
                location: 'Multiple locations',
                recommendation: 'Import and use OpenZeppelin\'s ReentrancyGuard and nonReentrant modifier'
            });
        }
        // Check for unbounded loops
        if (code.match(/for\s*\(\s*uint\d*\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*\w+\.length\s*;/)) {
            issues.push({
                severity: 'medium',
                description: 'Unbounded loop over array: could cause gas limit issues',
                location: 'Loop constructs',
                recommendation: 'Consider adding a limit to the loop or using pagination'
            });
        }
        // Check for tx.origin usage
        if (code.includes('tx.origin')) {
            issues.push({
                severity: 'high',
                description: 'Use of tx.origin: vulnerable to phishing attacks',
                location: 'Authentication checks',
                recommendation: 'Use msg.sender instead of tx.origin for authentication'
            });
        }
        // Check for proper access control
        if (!code.includes('Ownable') && !code.includes('onlyOwner') && !code.includes('AccessControl')) {
            issues.push({
                severity: 'medium',
                description: 'Missing access control mechanisms',
                location: 'Contract definition',
                recommendation: 'Use OpenZeppelin\'s Ownable or AccessControl contracts'
            });
        }
        // Check for proper event emissions
        const functionCount = (code.match(/function\s+\w+\s*\(/g) || []).length;
        const eventEmitCount = (code.match(/emit\s+\w+\s*\(/g) || []).length;
        if (functionCount > eventEmitCount + 2) {
            issues.push({
                severity: 'low',
                description: 'Insufficient event emissions: important state changes might not be logged',
                location: 'State-changing functions',
                recommendation: 'Add events for all significant state changes'
            });
        }
        // Calculate a simple security score
        let score = 100;
        for (const issue of issues) {
            switch (issue.severity) {
                case 'critical':
                    score -= 25;
                    break;
                case 'high':
                    score -= 15;
                    break;
                case 'medium':
                    score -= 10;
                    break;
                case 'low':
                    score -= 5;
                    break;
            }
        }
        // Ensure score is within 0-100 range
        score = Math.max(0, Math.min(100, score));
        // List of checks that passed
        const passedChecks = [];
        if (!code.includes('selfdestruct')) {
            passedChecks.push('No use of selfdestruct');
        }
        if (code.includes('require(') || code.includes('revert(')) {
            passedChecks.push('Input validation with require/revert');
        }
        if (code.includes('SafeMath') || code.includes('pragma solidity ^0.8')) {
            passedChecks.push('Protection against arithmetic overflows');
        }
        if (!code.includes('assembly')) {
            passedChecks.push('No inline assembly');
        }
        if (code.includes('private') || code.includes('internal')) {
            passedChecks.push('Proper use of visibility modifiers');
        }
        // List of checks that failed (apart from the issues already reported)
        const failedChecks = [];
        if (!code.includes('revert(')) {
            failedChecks.push('Consider using revert with custom error messages');
        }
        if (!code.includes('// SPDX-License-Identifier:')) {
            failedChecks.push('Missing SPDX license identifier');
        }
        return {
            issues,
            score,
            passedChecks,
            failedChecks
        };
    }
    /**
     * Save a generated DApp to the database
     * @param userId User ID
     * @param name Project name
     * @param description Project description
     * @param code Generated code
     * @returns Created DApp record
     */
    async saveDapp(userId, name, description, code) {
        try {
            // Create the DApp record
            const dapp = await storage_1.db
                .insert(dapp_schema_1.userDapps)
                .values({
                userId,
                name,
                description,
                status: 'draft',
                createdAt: new Date(),
                updatedAt: new Date(),
                chain: 'ethereum', // Default chain
                additionalDetails: {
                    generatedAt: new Date().toISOString(),
                    securityScore: code.securityReport?.score || null
                }
            })
                .returning();
            const dappId = dapp[0].id;
            // Create a version record
            const version = await storage_1.db
                .insert(dapp_schema_1.dappVersions)
                .values({
                userDappId: dappId,
                version: '0.1.0',
                changes: 'Initial generation',
                createdAt: new Date()
            })
                .returning();
            const versionId = version[0].id;
            // Save the main contract file
            await storage_1.db
                .insert(dapp_schema_1.dappFiles)
                .values({
                userDappId: dappId,
                dappVersionId: versionId,
                name: `${name.replace(/\s+/g, '')}.sol`,
                path: `/contracts/${name.replace(/\s+/g, '')}.sol`,
                content: code.contractCode,
                fileType: 'solidity',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            // Save test file if available
            if (code.testCode) {
                await storage_1.db
                    .insert(dapp_schema_1.dappFiles)
                    .values({
                    userDappId: dappId,
                    dappVersionId: versionId,
                    name: `${name.replace(/\s+/g, '')}.test.js`,
                    path: `/test/${name.replace(/\s+/g, '')}.test.js`,
                    content: code.testCode,
                    fileType: 'javascript',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            // Save UI file if available
            if (code.uiCode) {
                await storage_1.db
                    .insert(dapp_schema_1.dappFiles)
                    .values({
                    userDappId: dappId,
                    dappVersionId: versionId,
                    name: `${name.replace(/\s+/g, '')}UI.jsx`,
                    path: `/frontend/components/${name.replace(/\s+/g, '')}UI.jsx`,
                    content: code.uiCode,
                    fileType: 'react',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            // Save documentation if available
            if (code.docs) {
                await storage_1.db
                    .insert(dapp_schema_1.dappFiles)
                    .values({
                    userDappId: dappId,
                    dappVersionId: versionId,
                    name: `${name.replace(/\s+/g, '')}.md`,
                    path: `/docs/${name.replace(/\s+/g, '')}.md`,
                    content: code.docs,
                    fileType: 'markdown',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            return dapp[0];
        }
        catch (error) {
            console.error('Error saving DApp:', error);
            throw error;
        }
    }
}
exports.CodeGenerator = CodeGenerator;
exports.codeGenerator = new CodeGenerator();
