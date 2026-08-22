import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function MomentForm({ moment, onClose, onSaved }) {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [displayOrder, setDisplayOrder] = useState(1);
    const [active, setActive] = useState(true);

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");


    /* =========================================
       LOAD EXISTING MOMENT
    ========================================= */

    useEffect(() => {

        if (moment) {

            setTitle(moment.title || "");
            setDescription(moment.description || "");
            setDisplayOrder(moment.display_order || 1);
            setActive(moment.active ?? true);

            if (moment.image_url) {
                setPreview(moment.image_url);
            }

        } else {

            setTitle("");
            setDescription("");
            setDisplayOrder(1);
            setActive(true);
            setPreview("");

        }

        setImage(null);
        setError("");

    }, [moment]);


    /* =========================================
       IMAGE SELECTION
    ========================================= */

    function handleImageChange(event) {

        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {

            setError("Please select a valid image file.");

            return;
        }

        if (file.size > 8 * 1024 * 1024) {

            setError("Image must be smaller than 8 MB.");

            return;
        }

        setImage(file);

        setPreview(URL.createObjectURL(file));

        setError("");
    }


    /* =========================================
       UPLOAD IMAGE
    ========================================= */

    async function uploadImage(file) {

        const extension =
            file.name.split(".").pop().toLowerCase();

        const safeName =
            title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
                .substring(0, 60);

        const filePath =
            `moments/${safeName}-${Date.now()}.${extension}`;


        const { error: uploadError } =
            await supabase.storage
                .from("mcc_media")
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type,
                });


        if (uploadError) {
            throw uploadError;
        }


        const { data } =
            supabase.storage
                .from("mcc_media")
                .getPublicUrl(filePath);


        return data.publicUrl;
    }


    /* =========================================
       SAVE MOMENT
    ========================================= */

    async function handleSubmit(event) {

        event.preventDefault();

        setError("");


        if (!title.trim()) {

            setError("Please enter a title.");

            return;
        }


        if (!description.trim()) {

            setError("Please enter a description.");

            return;
        }


        if (!moment && !image) {

            setError("Please select an image.");

            return;
        }


        setSaving(true);


        try {

            let imageUrl =
                moment?.image_url || null;


            /* Upload new image */

            if (image) {

                imageUrl =
                    await uploadImage(image);

            }


            const momentData = {

                title: title.trim(),

                description:
                    description.trim(),

                image_url: imageUrl,

                display_order:
                    Number(displayOrder) || 1,

                active,

            };


            /* =====================================
               UPDATE
            ===================================== */

            if (moment?.id) {

                const { error: updateError } =
                    await supabase
                        .from("moments")
                        .update(momentData)
                        .eq("id", moment.id);


                if (updateError) {
                    throw updateError;
                }

            }


            /* =====================================
               INSERT
            ===================================== */

            else {

                const { error: insertError } =
                    await supabase
                        .from("moments")
                        .insert([momentData]);


                if (insertError) {
                    throw insertError;
                }

            }


            onSaved();

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Something went wrong while saving the moment."
            );

        } finally {

            setSaving(false);

        }

    }


    return (

        <div className="moment-modal-overlay">

            <div className="moment-modal">

                {/* =================================
                    HEADER
                ================================= */}

                <div className="moment-modal-header">

                    <div>

                        <span className="modal-kicker">
                            MCC CONTENT MANAGEMENT
                        </span>

                        <h2>
                            {moment
                                ? "Edit Moment"
                                : "Add Moment"}
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
                    className="moment-form"
                    onSubmit={handleSubmit}
                >

                    {/* TITLE */}

                    <div className="form-field full-width">

                        <label>
                            TITLE
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            placeholder="e.g. Applied AI Orientation"
                            disabled={saving}
                        />

                    </div>


                    {/* DESCRIPTION */}

                    <div className="form-field full-width">

                        <label>
                            DESCRIPTION
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            placeholder="Write about this MCC moment..."
                            rows="6"
                            disabled={saving}
                        />

                    </div>

                    {/* DISPLAY ORDER */}

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


                    {/* IMAGE */}

                    <div className="form-field full-width">

                        <label>
                            MOMENT IMAGE
                        </label>


                        <div className="moment-image-upload">

                            <div className="moment-image-preview">

                                {preview ? (

                                    <img
                                        src={preview}
                                        alt="Moment preview"
                                    />

                                ) : (

                                    <div>
                                        NO IMAGE
                                    </div>

                                )}

                            </div>


                            <div className="moment-upload-content">

                                <label
                                    htmlFor="moment-image"
                                    className="upload-button"
                                >
                                    {image
                                        ? "CHANGE IMAGE"
                                        : moment
                                            ? "REPLACE IMAGE"
                                            : "CHOOSE IMAGE"}
                                </label>

                                <input
                                    id="moment-image"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    disabled={saving}
                                    hidden
                                />

                                <span>
                                    JPG, PNG or WEBP · Max 8 MB
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* VISIBILITY */}

                    <div className="form-field full-width">

                        <div className="active-toggle-row">

                            <div>

                                <label>
                                    PUBLIC VISIBILITY
                                </label>

                                <p>
                                    Inactive moments will not
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
                                    setActive(!active)
                                }
                                disabled={saving}
                            >

                                <span></span>

                            </button>

                        </div>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="form-error full-width">
                            {error}
                        </div>

                    )}


                    {/* ACTIONS */}

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
                                : moment
                                    ? "SAVE CHANGES"
                                    : "ADD MOMENT"}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );
}

export default MomentForm;