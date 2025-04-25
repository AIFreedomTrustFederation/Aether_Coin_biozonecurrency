// ... existing imports
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/merch">Merch</Link></li>
        {/* Add other navigation links */}
      </ul>
    </nav>
  );
}

export default Header;