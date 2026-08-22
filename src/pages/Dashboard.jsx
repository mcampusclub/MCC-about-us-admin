import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Dashboard({ user, setActivePage }) {

    const [peopleCount, setPeopleCount] = useState(0);
    const [momentsCount, setMomentsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCounts();
    }, []);

    async function loadCounts() {

        setLoading(true);

        const { count: people } = await supabase
            .from("office_bearers")
            .select("*", {
                count: "exact",
                head: true
            });

        const { count: moments } = await supabase
            .from("moments")
            .select("*", {
                count: "exact",
                head: true
            });

        setPeopleCount(people || 0);
        setMomentsCount(moments || 0);

        setLoading(false);
    }

    return (
        <section className="dashboard-view">

            <div className="dashboard-intro">

                <div>
                    <span className="section-kicker">
                        ADMINISTRATOR
                    </span>

                    <h1>
                        Welcome back<span>.</span>
                    </h1>

                    <p>
                        Manage the people, memories and
                        stories that shape Microsoft Campus Club.
                    </p>
                </div>

                <div className="dashboard-date">
                    <span>SECURE ADMIN ENVIRONMENT</span>
                    <strong>MCC / CONTROL CENTER</strong>
                </div>

            </div>


            {/* Statistics */}

            <div className="stats-grid">

                <div className="stat-card">

                    <div className="stat-top">
                        <span>01</span>
                        <span>PEOPLE</span>
                    </div>

                    <div className="stat-number">
                        {loading ? "—" : peopleCount}
                    </div>

                    <div className="stat-label">
                        Active office bearers
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-top">
                        <span>02</span>
                        <span>MOMENTS</span>
                    </div>

                    <div className="stat-number">
                        {loading ? "—" : momentsCount}
                    </div>

                    <div className="stat-label">
                        Published memories
                    </div>

                </div>


                <div className="stat-card stat-card-accent">

                    <div className="stat-top">
                        <span>03</span>
                        <span>STATUS</span>
                    </div>

                    <div className="status-large">
                        <span></span>
                        ACTIVE
                    </div>

                    <div className="stat-label">
                        Database connection
                    </div>

                </div>

            </div>


            {/* Quick actions */}

            <div className="dashboard-section">

                <div className="section-heading">

                    <div>
                        <span className="section-kicker">
                            QUICK ACTIONS
                        </span>

                        <h2>Manage MCC</h2>
                    </div>

                    <span className="section-line"></span>

                </div>


                <div className="action-grid">

                    <button
                        className="action-card"
                        onClick={() => setActivePage("people")}
                    >

                        <span className="action-number">
                            01
                        </span>

                        <div className="action-content">
                            <h3>People Behind MCC</h3>

                            <p>
                                Add, edit and manage
                                office bearers and leadership.
                            </p>
                        </div>

                        <span className="action-arrow">
                            →
                        </span>

                    </button>


                    <button
                        className="action-card"
                        onClick={() => setActivePage("moments")}
                    >

                        <span className="action-number">
                            02
                        </span>

                        <div className="action-content">
                            <h3>Moments</h3>

                            <p>
                                Add and manage photographs,
                                memories and event stories.
                            </p>
                        </div>

                        <span className="action-arrow">
                            →
                        </span>

                    </button>

                </div>

            </div>


            {/* Information */}

            <div className="dashboard-info">

                <div className="info-symbol">
                    MCC
                </div>

                <div>
                    <span>CONTENT MANAGEMENT</span>

                    <p>
                        Changes made here will be reflected
                        automatically on the public MCC About
                        Us website.
                    </p>
                </div>

            </div>

        </section>
    );
}

export default Dashboard;