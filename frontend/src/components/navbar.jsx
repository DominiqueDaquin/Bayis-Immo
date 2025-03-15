import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Inscription</Link>
        </li>
        <li>
          <Link to="/login">Connexion</Link>
        </li>
        <li>
          <Link to="/home">Accueil</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;