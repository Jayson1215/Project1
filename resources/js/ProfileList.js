import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProfileList() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/profiles")
      .then((res) => setProfiles(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Profiles</h2>
      <ul>
        {profiles.map((profile) => (
          <li key={profile.id}>
            <strong>{profile.name}</strong> <br />
            <em>{profile.email}</em>
            {profile.bio && <p>{profile.bio}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
