import { useEffect, useState, useCallback } from "react";
import api from "../../api";

const isPast = (iso) => new Date(iso) < new Date();
const fmt = (iso) => (iso ? iso.substring(0, 10) : "");

const FILTERS = {
  all: "All",
  favourites: "Favourites",
  planned: "Planned",
  attended: "Attended",
};

const UserBrowser = ({ onError }) => {
  const [concerts, setConcerts] = useState([]);
  const [entries, setEntries] = useState({});
  const [drafts, setDrafts] = useState({});
  const [reviews, setReviews] = useState({});
  const [openReviews, setOpenReviews] = useState({});
  const [filter, setFilter] = useState("all");

  const loadConcerts = useCallback(async () => {
    try {
      const { data } = await api.get("/concerts");
      setConcerts(data);
    } catch (err) {
      onError(err);
    }
  }, [onError]);

  const loadEntries = useCallback(async () => {
    try {
      const { data } = await api.get("/entries");
      const map = {};
      data.forEach((e) => {
        if (e.concert) map[e.concert._id] = e;
      });
      setEntries(map);
    } catch (err) {
      onError(err);
    }
  }, [onError]);

  useEffect(() => {
    loadConcerts();
    loadEntries();
  }, [loadConcerts, loadEntries]);

  const fetchReviews = useCallback(
    async (concertId) => {
      try {
        const { data } = await api.get(`/concerts/${concertId}/reviews`);
        setReviews((prev) => ({ ...prev, [concertId]: data }));
      } catch (err) {
        onError(err);
      }
    },
    [onError],
  );

  const saveEntry = async (concertId, patch) => {
    const current = entries[concertId];
    const favourite = patch.favourite ?? current?.favourite ?? false;
    let status =
      patch.status !== undefined ? patch.status : (current?.status ?? "");
    status = status || "";

    try {
      if (current) {
        const body = { favourite, status: status === "" ? null : status };
        if (status === "attended") {
          body.rating = patch.rating ?? current.rating ?? null;
          body.review = patch.review ?? current.review ?? "";
        }
        await api.put(`/entries/${current._id}`, body);
      } else {
        if (!favourite && status === "") return;
        const body = {
          concert: concertId,
          favourite,
          status: status === "" ? null : status,
        };
        if (status === "attended") {
          body.rating = patch.rating ?? null;
          body.review = patch.review ?? "";
        }
        await api.post("/entries", body);
      }
      await loadEntries();
      if (openReviews[concertId]) await fetchReviews(concertId);
    } catch (err) {
      onError(err);
    }
  };

  const removeEntry = async (concertId) => {
    const current = entries[concertId];
    if (!current) return;
    try {
      await api.delete(`/entries/${current._id}`);
      await loadEntries();
      if (openReviews[concertId]) await fetchReviews(concertId);
    } catch (err) {
      onError(err);
    }
  };

  const toggleFavourite = (c) =>
    saveEntry(c._id, { favourite: !entries[c._id]?.favourite });

  const changeStatus = (c, status) => saveEntry(c._id, { status });

  const setDraft = (concertId, field, value) =>
    setDrafts((prev) => ({
      ...prev,
      [concertId]: { ...prev[concertId], [field]: value },
    }));

  const submitReview = (c) => {
    const d = drafts[c._id] || {};
    saveEntry(c._id, {
      status: "attended",
      rating: d.rating ? Number(d.rating) : null,
      review: d.review ?? "",
    });
  };

  const toggleReviews = async (concertId) => {
    const willOpen = !openReviews[concertId];
    setOpenReviews((prev) => ({ ...prev, [concertId]: willOpen }));
    if (willOpen && !reviews[concertId]) await fetchReviews(concertId);
  };

  const visible = concerts.filter((c) => {
    const e = entries[c._id];
    if (filter === "favourites") return e?.favourite;
    if (filter === "planned") return e?.status === "planned";
    if (filter === "attended") return e?.status === "attended";
    return true;
  });

  return (
    <section className="panel">
      <h2>Concerts</h2>

      <div className="filter-bar">
        {Object.keys(FILTERS).map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${
              filter === f ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setFilter(f)}
          >
            {FILTERS[f]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="muted">No concerts available for display.</p>
      ) : (
        <div className="cards">
          {visible.map((c) => {
            const e = entries[c._id];
            const past = isPast(c.date);
            const status = e?.status || "";
            const draft = drafts[c._id] || {};
            const rev = reviews[c._id];
            return (
              <div className="card" key={c._id}>
                <div className="card-head">
                  <div>
                    <strong>{c.band?.name || "?"}</strong>
                    <div className="muted">
                      {c.venue}
                      {c.city ? `, ${c.city}` : ""} - {fmt(c.date)}
                      {past ? "" : " (upcoming)"}
                    </div>
                  </div>
                  <button
                    className={`star ${e?.favourite ? "active" : ""}`}
                    title="Favourites"
                    onClick={() => toggleFavourite(c)}
                  >
                    {e?.favourite ? "\u2605" : "\u2606"}
                  </button>
                </div>

                <div className="card-controls">
                  <label className="checkbox">
                    Status:
                    <select
                      className="input"
                      value={status}
                      onChange={(ev) => changeStatus(c, ev.target.value)}
                    >
                      <option value="">No status</option>
                      <option value="planned">Planned</option>
                      <option value="attended" disabled={!past}>
                        Attended
                      </option>
                    </select>
                  </label>
                  {!past && (
                    <span className="muted">
                      Rating available after the concert
                    </span>
                  )}
                </div>

                {status === "attended" && past && (
                  <div className="card-review">
                    <select
                      className="input"
                      value={draft.rating ?? e?.rating ?? ""}
                      onChange={(ev) =>
                        setDraft(c._id, "rating", ev.target.value)
                      }
                    >
                      <option value="">Rating (1-5)</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <textarea
                      className="input"
                      rows="2"
                      placeholder="Your review"
                      value={draft.review ?? e?.review ?? ""}
                      onChange={(ev) =>
                        setDraft(c._id, "review", ev.target.value)
                      }
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => submitReview(c)}
                    >
                      Save Rating
                    </button>
                  </div>
                )}

                <div className="card-foot">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => toggleReviews(c._id)}
                  >
                    {openReviews[c._id] ? "Hide reviews" : "Other reviews"}
                  </button>
                  {e && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeEntry(c._id)}
                    >
                      Remove from my list
                    </button>
                  )}
                </div>

                {openReviews[c._id] && (
                  <div className="reviews">
                    {!rev ? (
                      <p className="muted">Loading...</p>
                    ) : rev.count === 0 ? (
                      <p className="muted">No reviews available.</p>
                    ) : (
                      <>
                        {rev.average != null && (
                          <div className="muted">
                            Average rating: {rev.average} / 5 ({rev.count})
                          </div>
                        )}
                        {rev.reviews.map((r) => (
                          <div className="review-item" key={r._id}>
                            <div className="review-head">
                              <strong>{r.user}</strong>
                              {r.rating != null && (
                                <span className="review-rating">
                                  {r.rating}/5
                                </span>
                              )}
                            </div>
                            {r.review && <div>{r.review}</div>}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default UserBrowser;
