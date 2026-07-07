import { useState } from "react";
import api from "../../api";

const emptyForm = {
  name: "",
  genre: "",
  country: "",
  formedYear: "",
  notes: "",
};

const BandsPanel = ({ bands, reload, onError }) => {
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
    const payload = {
      ...form,
      formedYear: form.formedYear === "" ? null : Number(form.formedYear),
    };
    try {
      if (editingId) {
        await api.put(`/bands/${editingId}`, payload);
      } else {
        await api.post("/bands", payload);
      }
      resetForm();
      reload();
    } catch (err) {
      onError(err);
    }
  };

  const startEdit = (band) => {
    setEditingId(band._id);
    setForm({
      name: band.name || "",
      genre: band.genre || "",
      country: band.country || "",
      formedYear: band.formedYear ?? "",
      notes: band.notes || "",
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this band and all its concerts?")) return;
    try {
      await api.delete(`/bands/${id}`);
      if (editingId === id) resetForm();
      reload();
    } catch (err) {
      onError(err);
    }
  };

  return (
    <section className="panel">
      <h2>Bands</h2>

      <form className="form-inline" onSubmit={handleSubmit}>
        <input
          className="input"
          name="name"
          placeholder="Band Name *"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="input"
          name="genre"
          placeholder="Genre"
          value={form.genre}
          onChange={handleChange}
        />
        <input
          className="input"
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={handleChange}
        />
        <input
          className="input"
          name="formedYear"
          type="number"
          placeholder="Formation Year"
          value={form.formedYear}
          onChange={handleChange}
          min="1900"
          max={new Date().getFullYear()}
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

      {bands.length === 0 ? (
        <p className="muted">No bands available. Add the first one above.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Genre</th>
              <th>Country</th>
              <th>Formation Year</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bands.map((b) => (
              <tr key={b._id}>
                <td>{b.name}</td>
                <td>{b.genre || "-"}</td>
                <td>{b.country || "-"}</td>
                <td>{b.formedYear || "-"}</td>
                <td className="row-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => startEdit(b)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => remove(b._id)}
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

export default BandsPanel;
