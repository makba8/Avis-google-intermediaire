const logo = require('../Ressources/logo.png');

function Header() {
return (
    <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h1>Votre avis compte</h1>
        <p>Merci de noter votre expérience.</p>
    </header>
);
}

export default Header;
