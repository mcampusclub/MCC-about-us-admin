function Header({ title, subtitle, user }) {
    return (
        <header className="admin-header">

            <div className="header-title">

                <span className="header-kicker">
                    MICROSOFT CAMPUS CLUB
                </span>

                <h2>{title}</h2>

                {subtitle && (
                    <p>{subtitle}</p>
                )}

            </div>

            <div className="header-user">

                <div className="user-status">
                    <span></span>
                    ONLINE
                </div>

                <div className="user-info">
                    <strong>MCC ADMIN</strong>
                    <small>{user?.email}</small>
                </div>

            </div>

        </header>
    );
}

export default Header;