import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import PersonForm from "../components/PersonForm";

const categoryOrder = [
    "Leadership",
    "Faculty & Administration",
    "Technical Team",
    "Event Team",
    "Office Bearers",
];

function getDisplayCategory(person) {

    const role = (person.role || "").toLowerCase();
    const category = person.category || "";

    /* Faculty & Administration */

    if (
        category === "Faculty" ||
        role.includes("patron") ||
        role.includes("president") ||
        role.includes("faculty advisor") ||
        role.includes("faculty incharge") ||
        role.includes("faculty in-charge")
    ) {
        return "Faculty & Administration";
    }


    /* Technical Team */

    if (
        category === "Team" ||
        role.includes("software") ||
        role.includes("technical")
    ) {
        return "Technical Team";
    }


    /* Event Team */

    if (
        role.includes("event coordinator") ||
        role.includes("event co-ordinator")
    ) {
        return "Event Team";
    }


    /* Leadership */

    if (
        role.includes("chairperson") ||
        role.includes("co chairperson") ||
        role.includes("co-chairperson") ||
        role.includes("secretary") ||
        role.includes("joint secretary")
    ) {
        return "Leadership";
    }


    /* Default */

    if (category === "Leadership") {
        return "Leadership";
    }

    if (category === "Event Team") {
        return "Event Team";
    }

    if (category === "Technical Team") {
        return "Technical Team";
    }

    return "Office Bearers";
}

function People() {

    const [people, setPeople] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [editingPerson, setEditingPerson] =
        useState(null);

    const [error, setError] = useState("");

    const [showInactive, setShowInactive] =
        useState(false);


    /* =========================================
       LOAD PEOPLE
    ========================================= */

    async function loadPeople() {

        setLoading(true);
        setError("");


        const { data, error: fetchError } =
            await supabase
                .from("office_bearers")
                .select("*")
                .order("display_order", {
                    ascending: true,
                });


        if (fetchError) {

            console.error(fetchError);

            setError(
                "Unable to load office bearers."
            );

            setPeople([]);

        } else {

            setPeople(data || []);

        }


        setLoading(false);
    }


    useEffect(() => {
        loadPeople();
    }, []);


    /* =========================================
       SEARCH + FILTER
    ========================================= */

    const filteredPeople = useMemo(() => {

        const query =
            search.trim().toLowerCase();


        return people.filter((person) => {

            const matchesStatus =
                showInactive
                    ? true
                    : person.active !== false;


            if (!matchesStatus) {
                return false;
            }


            if (!query) {
                return true;
            }


            return (
                person.name
                    ?.toLowerCase()
                    .includes(query) ||

                person.role
                    ?.toLowerCase()
                    .includes(query) ||

                person.department
                    ?.toLowerCase()
                    .includes(query) ||

                person.category
                    ?.toLowerCase()
                    .includes(query)
            );

        });

    }, [people, search, showInactive]);


    /* =========================================
       GROUP PEOPLE
    ========================================= */

    const groupedPeople = useMemo(() => {

        const groups = {};

        categoryOrder.forEach((category) => {
            groups[category] = [];
        });


        filteredPeople.forEach((person) => {

            const category = getDisplayCategory(person);


            if (!groups[category]) {
                groups[category] = [];
            }


            groups[category].push(person);

        });


        return groups;

    }, [filteredPeople]);


    /* =========================================
       ADD
    ========================================= */

    function handleAdd() {

        setEditingPerson(null);
        setShowForm(true);

    }


    /* =========================================
       EDIT
    ========================================= */

    function handleEdit(person) {

        setEditingPerson(person);
        setShowForm(true);

    }


    /* =========================================
       ARCHIVE / RESTORE
    ========================================= */

    async function toggleActive(person) {

        const action =
            person.active
                ? "archive"
                : "restore";


        const confirmation =
            person.active
                ? `Archive ${person.name}? They will no longer appear on the public About Us page.`
                : `Restore ${person.name}?`;


        const confirmed =
            window.confirm(confirmation);


        if (!confirmed) {
            return;
        }


        const { error: updateError } =
            await supabase
                .from("office_bearers")
                .update({
                    active: !person.active,
                })
                .eq("id", person.id);


        if (updateError) {

            console.error(updateError);

            setError(
                `Unable to ${action} this person.`
            );

            return;
        }


        await loadPeople();

    }


    /* =========================================
       FORM SAVED
    ========================================= */

    async function handleSaved() {

        setShowForm(false);
        setEditingPerson(null);

        await loadPeople();

    }


    /* =========================================
       RENDER
    ========================================= */

    return (
        <section className="people-view">

            {/* PAGE HEADER */}

            <div className="people-page-header">

                <div>

                    <span className="section-kicker">
                        MCC CONTENT MANAGEMENT
                    </span>

                    <h1>
                        People Behind MCC<span>.</span>
                    </h1>

                    <p>
                        Manage the people who shape
                        Microsoft Campus Club.
                    </p>

                </div>


                <button
                    className="add-person-button"
                    onClick={handleAdd}
                >
                    <span>+</span>
                    ADD PERSON
                </button>

            </div>


            {/* TOOLBAR */}

            <div className="people-toolbar">

                <div className="people-search">

                    <span>⌕</span>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search by name, role or department..."
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


            {/* ERROR */}

            {error && (

                <div className="people-error">
                    {error}
                </div>

            )}


            {/* LOADING */}

            {loading ? (

                <div className="people-loading">

                    <div className="loading-spinner"></div>

                    <span>
                        LOADING PEOPLE...
                    </span>

                </div>

            ) : filteredPeople.length === 0 ? (

                <div className="people-empty">

                    <div className="empty-symbol">
                        MCC
                    </div>

                    <h2>
                        No people found<span>.</span>
                    </h2>

                    <p>
                        {search
                            ? "Try changing your search."
                            : "Add your first MCC office bearer."}
                    </p>

                    {!search && (

                        <button
                            className="add-person-button"
                            onClick={handleAdd}
                        >
                            <span>+</span>
                            ADD FIRST PERSON
                        </button>

                    )}

                </div>

            ) : (

                <div className="people-groups">

                    {categoryOrder.map((category) => {

                        const members =
                            groupedPeople[category] || [];


                        if (members.length === 0) {
                            return null;
                        }


                        return (

                            <section
                                className="people-group"
                                key={category}
                            >

                                <div className="people-group-heading">

                                    <div>

                                        <span>
                                            {String(
                                                categoryOrder.indexOf(
                                                    category
                                                ) + 1
                                            ).padStart(2, "0")}
                                        </span>

                                        <h2>
                                            {category}
                                        </h2>

                                    </div>

                                    <div className="group-count">
                                        {members.length}
                                        {" "}
                                        {members.length === 1
                                            ? "PERSON"
                                            : "PEOPLE"}
                                    </div>

                                </div>


                                <div className="people-list">

                                    {members.map((person) => (

                                        <PersonCard
                                            key={person.id}
                                            person={person}
                                            onEdit={handleEdit}
                                            onToggleActive={
                                                toggleActive
                                            }
                                        />

                                    ))}

                                </div>

                            </section>

                        );

                    })}

                </div>

            )}


            {/* FORM MODAL */}

            {showForm && (

                <PersonForm
                    person={editingPerson}
                    onClose={() => {
                        setShowForm(false);
                        setEditingPerson(null);
                    }}
                    onSaved={handleSaved}
                />

            )}

        </section>
    );
}


/* =========================================
   PERSON CARD
========================================= */

function PersonCard({
    person,
    onEdit,
    onToggleActive,
}) {

    const initials =
        person.name
            ?.split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) =>
                part.charAt(0).toUpperCase()
            )
            .join("") || "M";


    return (

        <article
            className={
                person.active === false
                    ? "person-card inactive"
                    : "person-card"
            }
        >

            <div className="person-card-main">


                {/* PHOTO */}

                <div className="person-avatar">

                    {person.photo_url ? (

                        <img
                            src={person.photo_url}
                            alt={person.name}
                        />

                    ) : (

                        <span>
                            {initials}
                        </span>

                    )}

                </div>


                {/* DETAILS */}

                <div className="person-details">

                    <div className="person-name-row">

                        <h3>
                            {person.name}
                        </h3>

                        {person.active === false && (

                            <span className="inactive-badge">
                                INACTIVE
                            </span>

                        )}

                    </div>


                    <p className="person-role">
                        {person.role}
                    </p>


                    <div className="person-meta">

                        {person.department && (
                            <span>
                                {person.department}
                            </span>
                        )}

                        {person.year_of_study && (
                            <span>
                                {person.year_of_study}
                            </span>
                        )}

                        <span>
                            #{person.display_order || 1}
                        </span>

                    </div>

                </div>

            </div>


            {/* ACTIONS */}

            <div className="person-actions">

                <button
                    className="person-edit"
                    onClick={() =>
                        onEdit(person)
                    }
                >
                    EDIT
                </button>

                <button
                    className={
                        person.active
                            ? "person-archive"
                            : "person-restore"
                    }
                    onClick={() =>
                        onToggleActive(person)
                    }
                >
                    {person.active
                        ? "ARCHIVE"
                        : "RESTORE"}
                </button>

                <span className="person-arrow">
                    →
                </span>

            </div>

        </article>
    );
}

export default People;