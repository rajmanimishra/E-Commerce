import React, { useEffect, useState } from "react";

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getProfile = async () => {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "https://e-commerce-z6p4.onrender.com/api/auth/profile",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
            } else {
                console.log(data.message);
            }
        };

        getProfile();
    }, []);

    return (
        <div>
            <h2>Profile</h2>

            {user && (
                <div>
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                </div>
            )}
        </div>
    );
};

export default Profile;