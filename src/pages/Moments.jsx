import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import MomentForm from "../components/MomentForm";


function Moments() {

    const [moments, setMoments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [showInactive, setShowInactive] =
        useState(false);

    const [showForm, setShowForm] =
        useState(false);

    const [editingMoment, setEditingMoment] =
        useState(null);

    const [error, setError] = useState("");


    /* =========================================
       LOAD MOMENTS
    ========================================= */

    async function loadMoments() {

        setLoading(true);
        setError("");


        const { data, error: fetchError } =
            await supabase
                .from("moments")
                .select("*")
                .order("display_order", {
                    ascending: true,
                });


        if (fetchError) {

            console.error(fetchError);

            setError(
                "Unable to load moments."
            );

            setMoments([]);

        } else {

            setMoments(data || []);

        }


        setLoading(false);
    }


    useEffect(() => {

        loadMoments();

    }, []);


    /* =========================================
       SEARCH + FILTER
    ========================================= */

    const filteredMoments = useMemo(() => {

        const query =
            search.trim().toLowerCase();


        return moments.filter((moment) => {

            /* Active / inactive */

            if (
                !showInactive &&
                moment.active === false
            ) {
                return false;
            }


            /* Search */

            if (!query) {
                return true;
            }


            return (

                moment.title
                    ?.toLowerCase()
                    .includes(query)

                ||

                moment.description
                    ?.toLowerCase()
                    .includes(query)

            );

        });

    }, [moments, search, showInactive]);


    /* =========================================
       ADD MOMENT
    ========================================= */

    function handleAdd() {

        setEditingMoment(null);

        setShowForm(true);

    }


    /* =========================================
       EDIT MOMENT
    ========================================= */

    function handleEdit(moment) {

        setEditingMoment(moment);

        setShowForm(true);

    }


    /* =========================================
       ARCHIVE / RESTORE
    ========================================= */

    async function toggleActive(moment) {

        const isArchiving =
            moment.active !== false;


        const confirmation =
            isArchiving
                ? `Archive "${moment.title}"? It will no longer appear on the public About Us page.`
                : `Restore "${moment.title}"?`;


        if (!window.confirm(confirmation)) {
            return;
        }


        const { error: updateError } =
            await supabase
                .from("moments")
                .update({
                    active: !isArchiving,
                })
                .eq("id", moment.id);


        if (updateError) {

            console.error(updateError);

            setError(
                isArchiving
                    ? "Unable to archive this moment."
                    : "Unable to restore this moment."
            );

            return;
        }


        await loadMoments();
    }


    /* =========================================
       FORM SAVED
    ========================================= */

    async function handleSaved() {

        setShowForm(false);

        setEditingMoment(null);

        await loadMoments();

    }


    /* =========================================
       RENDER
    ========================================= */

    return (

        <section className="moments-view">

            {/* =================================
                HEADER
            ================================= */}

            <div className="moments-page-header">

                <div>

                    <span className="section-kicker">
                        MCC CONTENT MANAGEMENT
                    </span>

                    <h1>
                        Moments<span>.</span>
                    </h1>

                    <p>
                        Manage the memories and stories
                        that shape Microsoft Campus Club.
                    </p>

                </div>


                <button
                    className="add-person-button"
                    onClick={handleAdd}
                >
                    <span>+</span>
                    ADD MOMENT
                </button>

            </div>


            {/* =================================
                TOOLBAR
            ================================= */}

            <div className="people-toolbar">

                <div className="people-search">

                    <span>⌕</span>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search moments..."
                    />

                </div>


                <button
                    className={
                        showInactive
                            ? "inactive-filter active"
                            : "inactive-filter"
                    }
                    onClick={() =>
                        setShowInactive(!showInactive)
                    }
                >
                    {showInactive
                        ? "HIDE INACTIVE"
                        : "SHOW INACTIVE"}
                </button>

            </div>


            {/* =================================
                ERROR
            ================================= */}

            {error && (

                <div className="people-error">
                    {error}
                </div>

            )}


            {/* =================================
                LOADING
            ================================= */}

            {loading ? (

                <div className="people-loading">

                    <div className="loading-spinner"></div>

                    <span>
                        LOADING MOMENTS...
                    </span>

                </div>

            ) : filteredMoments.length === 0 ? (

                <div className="people-empty">

                    <div className="empty-symbol">
                        MCC
                    </div>

                    <h2>
                        No moments found<span>.</span>
                    </h2>

                    <p>
                        {search
                            ? "Try changing your search."
                            : "Add your first MCC memory."}
                    </p>


                    {!search && (

                        <button
                            className="add-person-button"
                            onClick={handleAdd}
                        >
                            <span>+</span>
                            ADD FIRST MOMENT
                        </button>

                    )}

                </div>

            ) : (

                <div className="moments-list">

                    {filteredMoments.map(
                        (moment, index) => (

                            <article
                                className={
                                    moment.active === false
                                        ? "moment-card inactive"
                                        : "moment-card"
                                }
                                key={moment.id}
                            >

                                {/* IMAGE */}

                                <div className="moment-card-image">

                                    <img
                                        src={
                                            moment.image_url
                                        }
                                        alt={
                                            moment.title
                                        }
                                    />

                                    <div className="moment-number">

                                        {String(
                                            index + 1
                                        ).padStart(2, "0")}

                                    </div>

                                </div>


                                {/* CONTENT */}

                                <div className="moment-card-content">

                                    <div className="moment-card-top">

                                        {moment.active === false && (

                                            <span className="inactive-badge">
                                                INACTIVE
                                            </span>

                                        )}

                                    </div>


                                    <h2>
                                        {moment.title}
                                    </h2>


                                    <p>
                                        {moment.description}
                                    </p>


                                    <div className="moment-card-meta">

                                        <span>
                                            ORDER #
                                            {moment.display_order}
                                        </span>

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="moment-card-actions">

                                        <button
                                            className="person-edit"
                                            onClick={() =>
                                                handleEdit(
                                                    moment
                                                )
                                            }
                                        >
                                            EDIT
                                        </button>


                                        <button
                                            className={
                                                moment.active
                                                    ? "person-archive"
                                                    : "person-restore"
                                            }
                                            onClick={() =>
                                                toggleActive(
                                                    moment
                                                )
                                            }
                                        >
                                            {moment.active
                                                ? "ARCHIVE"
                                                : "RESTORE"}
                                        </button>


                                        <span className="person-arrow">
                                            →
                                        </span>

                                    </div>

                                </div>

                            </article>

                        )
                    )}

                </div>

            )}


            {/* =================================
                FORM
            ================================= */}

            {showForm && (

                <MomentForm
                    moment={editingMoment}

                    onClose={() => {

                        setShowForm(false);

                        setEditingMoment(null);

                    }}

                    onSaved={handleSaved}
                />

            )}

        </section>
    );
}


export default Moments;