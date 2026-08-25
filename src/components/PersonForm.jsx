import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const categories = [
    "Leadership",
    "Faculty & Administration",
    "Technical Team",
    "Event Team",
    "Office Bearers",
];

const departmentOptions = [
    "CSE",
    "AI&DS",
    "IT",
    "ECE",
    "EEE",
    "MECH",
    "CIVIL",
    "Other",
];

const yearOptions = [
    "I",
    "II",
    "III",
    "IV",
];

function PersonForm({ person, onClose, onSaved }) {

    /* =========================================
       FORM STATE
    ========================================= */

    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [category, setCategory] = useState("Office Bearers");

    const [personType, setPersonType] = useState("student");

    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");
    const [designation, setDesignation] = useState("");

    const [displayOrder, setDisplayOrder] = useState(1);
    const [active, setActive] = useState(true);

    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState("");
    const [removePhoto, setRemovePhoto] = useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");


    /* =========================================
       LOAD EXISTING PERSON
    ========================================= */

    useEffect(() => {

        if (person) {

            setName(person.name || "");

            setRole(person.role || "");

            /*
             * Convert old categories if any old
             * records still contain:
             * Faculty → Faculty & Administration
             * Team → Technical Team
             */

            if (person.category === "Faculty") {

                setCategory("Faculty & Administration");

            } else if (person.category === "Team") {

                setCategory("Technical Team");

            } else {

                setCategory(
                    person.category || "Office Bearers"
                );

            }


            setPersonType(
                person.person_type || "student"
            );


            setDepartment(
                person.department || ""
            );


            setYear(
                person.year || ""
            );


            setDesignation(
                person.designation || ""
            );


            setDisplayOrder(
                person.display_order || 1
            );


            setActive(
                person.active ?? true
            );


            if (person.photo_url) {

                setPreview(
                    person.photo_url
                );

            } else {

                setPreview("");

            }

        } else {

            /*
             * RESET FORM FOR NEW PERSON
             */

            setName("");

            setRole("");

            setCategory("Office Bearers");

            setPersonType("student");

            setDepartment("");

            setYear("");

            setDesignation("");

            setDisplayOrder(1);

            setActive(true);

            setPreview("");
        }


        setPhoto(null);
        setRemovePhoto(false);
        setError("");

    }, [person]);


    /* =========================================
       REMOVE PHOTO
    ========================================= */

    function handleRemovePhoto() {
        setPhoto(null);
        setPreview("");
        setRemovePhoto(true);
        setError("");
    }


    /* =========================================
       PERSON TYPE CHANGE
    ========================================= */

    function handlePersonTypeChange(event) {

        const value = event.target.value;

        setPersonType(value);

        /*
         * Student:
         * Department + Year required
         *
         * Faculty:
         * Designation required
         */

        if (value === "student") {

            setDesignation("");

        } else {

            setDepartment("");
            setYear("");

        }
    }


    /* =========================================
       IMAGE SELECTION
    ========================================= */

    function handlePhotoChange(event) {

        const file = event.target.files?.[0];

        if (!file) {
            return;
        }


        if (!file.type.startsWith("image/")) {

            setError(
                "Please select an image file."
            );

            return;
        }


        if (file.size > 5 * 1024 * 1024) {

            setError(
                "Image must be smaller than 5 MB."
            );

            return;
        }


        setPhoto(file);
        setRemovePhoto(false);

        setPreview(
            URL.createObjectURL(file)
        );

        setError("");
    }



    /* =========================================
       UPLOAD IMAGE TO SUPABASE STORAGE
    ========================================= */

    async function uploadPhoto(file) {

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const safeName =
            name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");


        const filePath =
            `office-bearers/${safeName}-${Date.now()}.${extension}`;


        const {
            error: uploadError
        } = await supabase.storage
            .from("mcc_media")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type,
                }
            );


        if (uploadError) {

            throw uploadError;

        }


        const {
            data
        } = supabase.storage
            .from("mcc_media")
            .getPublicUrl(filePath);


        return data.publicUrl;
    }


    /* =========================================
       SAVE PERSON
    ========================================= */

    async function handleSubmit(event) {

        event.preventDefault();

        setError("");


        /* NAME VALIDATION */

        if (!name.trim()) {

            setError(
                "Please enter the person's name."
            );

            return;
        }


        /* ROLE VALIDATION */

        if (!role.trim()) {

            setError(
                "Please enter the person's role."
            );

            return;
        }


        /* STUDENT VALIDATION */

        if (personType === "student") {

            if (!department) {

                setError(
                    "Please select a department."
                );

                return;
            }


            if (!year) {

                setError(
                    "Please select a year."
                );

                return;
            }

        }


        /* FACULTY VALIDATION */

        if (personType === "faculty") {

            if (!designation.trim()) {

                setError(
                    "Please enter the designation."
                );

                return;
            }

        }


        setSaving(true);


        try {

            /* -------------------------------------
               RESOLVE PHOTO URL
            ------------------------------------- */

            let photoUrl =
                person?.photo_url || null;

            if (removePhoto) {
                photoUrl = null;
            } else if (photo) {
                photoUrl =
                    await uploadPhoto(photo);
            }



            /* -------------------------------------
               PREPARE DATABASE DATA
            ------------------------------------- */

            const personData = {

                name:
                    name.trim(),

                role:
                    role.trim(),

                category,

                person_type:
                    personType,

                department:
                    personType === "student"
                        ? department
                        : null,

                year:
                    personType === "student"
                        ? year
                        : null,

                designation:
                    personType === "faculty"
                        ? designation.trim()
                        : null,

                photo_url:
                    photoUrl,

                display_order:
                    Number(displayOrder) || 1,

                active,
            };


            /* -------------------------------------
               UPDATE EXISTING PERSON
            ------------------------------------- */

            if (person?.id) {

                const {
                    error: updateError
                } = await supabase
                    .from("office_bearers")
                    .update(personData)
                    .eq("id", person.id);


                if (updateError) {

                    throw updateError;

                }

            }


            /* -------------------------------------
               INSERT NEW PERSON
            ------------------------------------- */

            else {

                const {
                    error: insertError
                } = await supabase
                    .from("office_bearers")
                    .insert([
                        personData
                    ]);


                if (insertError) {

                    throw insertError;

                }

            }


            /* -------------------------------------
               SUCCESS
            ------------------------------------- */

            onSaved();


        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Something went wrong while saving."
            );


        } finally {

            setSaving(false);

        }
    }


    /* =========================================
       RENDER
    ========================================= */

    return (

        <div className="person-modal-overlay">

            <div className="person-modal">


                {/* =================================
                   HEADER
                ================================= */}

                <div className="person-modal-header">

                    <div>

                        <span className="modal-kicker">
                            MCC CONTENT MANAGEMENT
                        </span>

                        <h2>
                            {person
                                ? "Edit Person"
                                : "Add Person"}
                        </h2>

                    </div>


                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={saving}
                    >
                        ×
                    </button>

                </div>


                {/* =================================
                   FORM
                ================================= */}

                <form
                    className="person-form"
                    onSubmit={handleSubmit}
                >


                    {/* =================================
                       FULL NAME
                    ================================= */}

                    <div className="form-field full-width">

                        <label>
                            FULL NAME
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                            placeholder="Enter full name"
                            disabled={saving}
                        />

                    </div>


                    {/* =================================
                       ROLE
                    ================================= */}

                    <div className="form-field">

                        <label>
                            ROLE
                        </label>

                        <input
                            type="text"
                            value={role}
                            onChange={(e) =>
                                setRole(
                                    e.target.value
                                )
                            }
                            placeholder="e.g. Chairperson"
                            disabled={saving}
                        />

                    </div>


                    {/* =================================
                       CATEGORY
                    ================================= */}

                    <div className="form-field">

                        <label>
                            CATEGORY
                        </label>

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(
                                    e.target.value
                                )
                            }
                            disabled={saving}
                        >

                            {categories.map(
                                (item) => (

                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* =================================
                       PERSON TYPE
                    ================================= */}

                    <div className="form-field">

                        <label>
                            PERSON TYPE
                        </label>

                        <select
                            value={personType}
                            onChange={
                                handlePersonTypeChange
                            }
                            disabled={saving}
                        >

                            <option value="student">
                                Student
                            </option>

                            <option value="faculty">
                                Faculty / Staff
                            </option>

                        </select>

                    </div>


                    {/* =================================
                       STUDENT FIELDS
                    ================================= */}

                    {personType === "student" && (

                        <>

                            {/* DEPARTMENT */}

                            <div className="form-field">

                                <label>
                                    DEPARTMENT
                                </label>

                                <select
                                    value={department}
                                    onChange={(e) =>
                                        setDepartment(
                                            e.target.value
                                        )
                                    }
                                    disabled={saving}
                                    required
                                >

                                    <option value="">
                                        Select department
                                    </option>

                                    {departmentOptions.map(
                                        (dept) => (

                                            <option
                                                key={dept}
                                                value={dept}
                                            >
                                                {dept}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* YEAR */}

                            <div className="form-field">

                                <label>
                                    YEAR
                                </label>

                                <select
                                    value={year}
                                    onChange={(e) =>
                                        setYear(
                                            e.target.value
                                        )
                                    }
                                    disabled={saving}
                                    required
                                >

                                    <option value="">
                                        Select year
                                    </option>

                                    {yearOptions.map(
                                        (item) => (

                                            <option
                                                key={item}
                                                value={item}
                                            >
                                                {item}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        </>

                    )}


                    {/* =================================
                       FACULTY DESIGNATION
                    ================================= */}

                    {personType === "faculty" && (

                        <div className="form-field full-width">

                            <label>
                                DESIGNATION
                            </label>

                            <input
                                type="text"
                                value={designation}
                                onChange={(e) =>
                                    setDesignation(
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. Principal"
                                disabled={saving}
                                required
                            />

                        </div>

                    )}


                    {/* =================================
                       DISPLAY ORDER
                    ================================= */}

                    <div className="form-field">

                        <label>
                            DISPLAY ORDER
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={displayOrder}
                            onChange={(e) =>
                                setDisplayOrder(
                                    e.target.value
                                )
                            }
                            disabled={saving}
                        />

                    </div>


                    {/* =================================
                       PROFILE IMAGE
                    ================================= */}

                    <div className="form-field full-width">

                        <label>
                            PROFILE IMAGE
                        </label>

                        <div className="photo-upload-area">


                            {/* PREVIEW */}

                            <div className="photo-preview">

                                {preview ? (

                                    <img
                                        src={preview}
                                        alt="Preview"
                                    />

                                ) : (

                                    <div className="photo-placeholder">
                                        NO IMAGE
                                    </div>

                                )}

                            </div>


                            {/* UPLOAD & REMOVE */}

                            <div className="photo-upload-content">

                                <div className="photo-button-row">

                                    <label
                                        htmlFor="person-photo"
                                        className="upload-button"
                                    >
                                        {preview
                                            ? "CHANGE IMAGE"
                                            : "CHOOSE IMAGE"}
                                    </label>

                                    {preview && (

                                        <button
                                            type="button"
                                            className="remove-photo-button"
                                            onClick={handleRemovePhoto}
                                            disabled={saving}
                                        >
                                            REMOVE IMAGE
                                        </button>

                                    )}

                                </div>

                                <input
                                    id="person-photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        handlePhotoChange
                                    }
                                    disabled={saving}
                                    hidden
                                />

                                <span>
                                    JPG, PNG or WEBP ·
                                    Max 5 MB
                                </span>

                            </div>


                        </div>

                    </div>


                    {/* =================================
                       PUBLIC VISIBILITY
                    ================================= */}

                    <div className="form-field full-width">

                        <div className="active-toggle-row">

                            <div>

                                <label>
                                    PUBLIC VISIBILITY
                                </label>

                                <p>
                                    Inactive people will not
                                    appear on the public
                                    About Us page.
                                </p>

                            </div>


                            <button
                                type="button"
                                className={
                                    active
                                        ? "toggle active"
                                        : "toggle"
                                }
                                onClick={() =>
                                    setActive(
                                        !active
                                    )
                                }
                                disabled={saving}
                            >

                                <span></span>

                            </button>

                        </div>

                    </div>


                    {/* =================================
                       ERROR
                    ================================= */}

                    {error && (

                        <div className="form-error full-width">

                            {error}

                        </div>

                    )}


                    {/* =================================
                       ACTIONS
                    ================================= */}

                    <div className="form-actions full-width">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            CANCEL
                        </button>


                        <button
                            type="submit"
                            className="save-button"
                            disabled={saving}
                        >

                            {saving
                                ? "SAVING..."
                                : person
                                    ? "SAVE CHANGES"
                                    : "ADD PERSON"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default PersonForm;