import React, { useEffect, useState } from "react";

function BookForm({ editing, setEditing, refresh }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const API = "/api/books";


  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setAuthor(editing.author);
      setGenre(editing.genre);
    }
  }, [editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title, author, genre };

    if (editing) {
      await fetch(`${API}/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setEditing(null);
    } else {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setTitle("");
    setAuthor("");
    setGenre("");
    refresh();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Title"
        value={title}
        required
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder="Author"
        value={author}
        required
        onChange={(e) => setAuthor(e.target.value)}
      />
      <input
        placeholder="Genre"
        value={genre}
        required
        onChange={(e) => setGenre(e.target.value)}
      />
      <button type="submit">{editing ? "Update" : "Add Book"}</button>
      {editing && <button onClick={() => setEditing(null)}>Cancel</button>}
    </form>
  );
}

export default BookForm;
