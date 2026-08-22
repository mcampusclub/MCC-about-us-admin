function Sidebar({ activePage, setActivePage, onLogout }) {
    return (
        <aside className="admin-sidebar">

            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <img
                        src="/mcc-logo.jpg"
                        alt="Microsoft Campus Club"
                    />
                </div>

                <div>
                    <h1>MCC</h1>
                    <span>ADMIN PORTAL</span>
                </div>
            </div>

            <nav className="sidebar-nav">

                <button
                    className={
                        activePage === "dashboard"
                            ? "nav-item active"
                            : "nav-item"
                    }
                    onClick={() => setActivePage("dashboard")}
                >
                    <span className="nav-number">01</span>
                    <span>Dashboard</span>
                </button>

                <button
                    className={
                        activePage === "people"
                            ? "nav-item active"
                            : "nav-item"
                    }
                    onClick={() => setActivePage("people")}
                >
                    <span className="nav-number">02</span>
                    <span>People Behind MCC</span>
                </button>

                <button
                    className={
                        activePage === "moments"
                            ? "nav-item active"
                            : "nav-item"
                    }
                    onClick={() => setActivePage("moments")}
                >
                    <span className="nav-number">03</span>
                    <span>Moments</span>
                </button>

            </nav>

            <div className="sidebar-bottom">

                <div className="sidebar-status">
                    <span className="status-dot"></span>
                    <span>SECURE SESSION</span>
                </div>

                <button
                    className="sidebar-logout"
                    onClick={onLogout}
                >
                    <span>↪</span>
                    LOG OUT
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;