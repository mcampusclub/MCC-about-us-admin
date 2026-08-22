import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import People from "./pages/People";
import Moments from "./pages/Moments";

function App() {

    const [user, setUser] = useState(null);
    const [checkingSession, setCheckingSession] = useState(true);
    const [activePage, setActivePage] = useState("dashboard");


    useEffect(() => {

        const getSession = async () => {

            const {
                data: { session }
            } = await supabase.auth.getSession();


            if (session?.user) {

                const { data: isAdmin } =
                    await supabase.rpc("is_mcc_admin");


                if (isAdmin) {
                    setUser(session.user);
                } else {
                    await supabase.auth.signOut();
                }

            }

            setCheckingSession(false);
        };


        getSession();


        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(
            async (_event, session) => {

                if (!session?.user) {
                    setUser(null);
                    return;
                }


                const { data: isAdmin } =
                    await supabase.rpc("is_mcc_admin");


                if (isAdmin) {
                    setUser(session.user);
                } else {
                    await supabase.auth.signOut();
                    setUser(null);
                }

            }
        );


        return () => {
            subscription.unsubscribe();
        };

    }, []);


    async function handleLogout() {

        await supabase.auth.signOut();

        setUser(null);
        setActivePage("dashboard");
    }


    if (checkingSession) {

        return (
            <div className="loading-screen">

                <div className="loading-spinner"></div>

                <span>
                    INITIALIZING MCC PORTAL...
                </span>

            </div>
        );
    }


    if (!user) {

        return (
            <Login
                onLogin={(loggedInUser) =>
                    setUser(loggedInUser)
                }
            />
        );
    }


    function getPageTitle() {

        if (activePage === "people") {
            return {
                title: "People Behind MCC",
                subtitle:
                    "Manage the people who shape the club."
            };
        }

        if (activePage === "moments") {
            return {
                title: "Moments",
                subtitle:
                    "Manage MCC memories and experiences."
            };
        }

        return {
            title: "Dashboard",
            subtitle:
                "Your MCC content control center."
        };
    }


    const pageInfo = getPageTitle();


    return (

        <div className="admin-layout">

            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                onLogout={handleLogout}
            />


            <main className="admin-main">

                <Header
                    title={pageInfo.title}
                    subtitle={pageInfo.subtitle}
                    user={user}
                />


                <div className="admin-content">

                    {activePage === "dashboard" && (

                        <Dashboard
                            user={user}
                            setActivePage={setActivePage}
                        />

                    )}


                    {activePage === "people" && <People />}


                    {activePage === "moments" && <Moments />}

                </div>

            </main>

        </div>
    );
}

export default App;