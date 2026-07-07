import { useState } from "react";
import api from "../../api";

const emptyForm = {
  band: "",
  venue: "",
  city: "",
  date: "",
  notes: "",
};

const formatDate = (iso) => (iso ? iso.substring(0, 10) : "");

const ConcertsPanel = ({ bands, concerts, reload, onError }) => {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const handleChange = ({ currentTarget: input }) => {
    setForm({ ...form, [input.name]: input.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/concerts/${editingId}`, form);
      } else {
        await api.post("/concerts", form);
      }
      resetForm();
      reload();
    } catch (err) {
      onError(err);
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setForm({
      band: c.band?._id || "",
      venue: c.venue || "",
      city: c.city || "",
      date: formatDate(c.date),
      notes: c.notes || "",
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this concert and its user entries?")) return;
    try {
      await api.delete(`/concerts/${id}`);
      if (editingId === id) resetForm();
      reload();
    } catch (err) {
      onError(err);
    }
  };

  return (
    <section className="panel">
      <h2>Concerts (catalog)</h2>

      {bands.length === 0 ? (
        <p className="muted">First, add a band to be able to add concerts.</p>
      ) : (
        <form className="form-inline" onSubmit={handleSubmit}>
          <select
            className="input"
            name="band"
            value={form.band}
            onChange={handleChange}
            required
          >
            <option value="">-- select band * --</option>
            {bands.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            name="venue"
            placeholder="Venue *"
            value={form.venue}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
          />
          <input
            className="input"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-sm">
              {editingId ? "Save" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {concerts.length === 0 ? (
        <p className="muted">No concerts available.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Band</th>
              <th>Venue</th>
              <th>City</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {concerts.map((c) => (
              <tr key={c._id}>
                <td>{c.band?.name || "-"}</td>
                <td>{c.venue}</td>
                <td>{c.city || "-"}</td>
                <td>{formatDate(c.date)}</td>
                <td className="row-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => startEdit(c)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => remove(c._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default ConcertsPanel;
