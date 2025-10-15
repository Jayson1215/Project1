import React, { useState } from "react";
import axios from "axios";

export default function ProfileForm({ onProfileAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/profiles", {
        name,
        email,
        bio,
      });

      setMessage("Profile added successfully!");
      setName("");
      setEmail("");
      setBio("");

      if (onProfileAdded) {
        onProfileAdded(res.data);
      }
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <h2>Add Profile</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <textarea
          placeholder="Bio (optional)"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
