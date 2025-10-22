import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { User, Save, X, AlertTriangle, Trash2 } from "lucide-react";
import api from "../../api";

const ProfilePage = () => {
    // State to hold the original user data
    const [user, setUser] = useState(null);
    // State to hold a temporary copy of user data for editing
    const [editableUser, setEditableUser] = useState({
        userName: '',
        userEmail: '',
        userBirthday: '',
        userContactNumber: '',
        userAddress: '',
    });
    // UI states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Function to fetch the current user's data from the backend
    const fetchUserData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.get('/profile');

            if (response.data) {
                const userData = response.data;
                setUser(userData);
                setEditableUser(userData); // Initialize editable state with fetched data
                setError(null);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Effect hook to fetch user data when the component mounts
    useEffect(() => {
        fetchUserData();
    }, []);

    // Handles changes to the input fields in edit mode
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableUser(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handles the "Save" action, sending a PUT request to the backend
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await api.put('/profile', editableUser);

            if (response.data) {
                const updatedUser = response.data;
                setUser(updatedUser); // Update the main user state with the new data
                setIsEditing(false); // Exit edit mode
                alert("Profile updated successfully!");
            }
        } catch (error) {
            console.error('Update error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle account deactivation
    const handleDeactivate = async () => {
        if (!window.confirm("Are you sure you want to deactivate your account?")) {
            return;
        }

        try {
            const response = await api.post('/profile/deactivate');

            if (response.data) {
                alert("Account deactivated successfully. You will now be logged out.");
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
            } else {
                alert(`Deactivation failed: ${response.data?.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Deactivation error:', error);
            alert("An error occurred during deactivation.");
        }
    };

    // Function to handle account deletion
    const handleDelete = async () => {
        if (!window.confirm("WARNING: Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await api.delete('/profile');

            if (response.data) {
                alert("Account deleted successfully. You will now be logged out.");
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
            } else {
                alert(`Deletion failed: ${response.data?.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Deletion error:', error);
            alert("An error occurred during deletion.");
        }
    };

    if (isLoading) {
        return <div>Loading profile...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    if (!user) {
        return <div>No user data available.</div>;
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center">
                    <User className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mr-2 sm:mr-3" />
                    My Profile
                </h1>
                <p className="text-white/90 mt-2 text-sm sm:text-base md:text-lg">
                    Manage your personal information and account settings
                </p>
            </div>

            <Card className="border-[#e5ded7] shadow-xl">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white p-4 sm:p-6">
                    <div>
                        <CardTitle className="text-[#5c3d28] flex items-center text-base sm:text-lg md:text-xl">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#a4785a]" />
                            Profile Information
                        </CardTitle>
                        <CardDescription className="text-[#7b5a3b] text-xs sm:text-sm">View and edit your personal details</CardDescription>
                    </div>
                    {isEditing ? (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button 
                                onClick={handleSave}
                                className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
                            >
                                <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Save
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditableUser(user); 
                                }}
                                className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200 text-xs sm:text-sm"
                            >
                                <X className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <Button 
                            onClick={() => setIsEditing(true)}
                            className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto text-xs sm:text-sm"
                        >
                            Edit Profile
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 p-4 sm:p-6">
                    <div>
                        <Label htmlFor="userName" className="text-xs sm:text-sm">Name</Label>
                        <Input
                            id="userName"
                            name="userName"
                            value={isEditing ? editableUser.userName : user.userName}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            className="text-xs sm:text-sm md:text-base"
                        />
                    </div>
                    <div>
                        <Label htmlFor="userEmail" className="text-xs sm:text-sm">Email</Label>
                        <Input
                            id="userEmail"
                            name="userEmail"
                            value={isEditing ? editableUser.userEmail : user.userEmail}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            className="text-xs sm:text-sm md:text-base"
                        />
                    </div>
                    <div>
                        <Label htmlFor="role" className="text-xs sm:text-sm">Role</Label>
                        <Input id="role" name="role" value={user.role} readOnly className="text-xs sm:text-sm md:text-base" />
                    </div>
                    <div>
                        <Label htmlFor="userBirthday" className="text-xs sm:text-sm">Birthday</Label>
                        <Input
                            id="userBirthday"
                            name="userBirthday"
                            value={isEditing ? editableUser.userBirthday : user.userBirthday}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            className="text-xs sm:text-sm md:text-base"
                        />
                    </div>
                    <div>
                        <Label htmlFor="userContactNumber" className="text-xs sm:text-sm">Contact Number</Label>
                        <Input
                            id="userContactNumber"
                            name="userContactNumber"
                            value={isEditing ? editableUser.userContactNumber || '' : user.userContactNumber || ''}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            className="text-xs sm:text-sm md:text-base"
                        />
                    </div>
                    <div>
                        <Label htmlFor="userAddress" className="text-xs sm:text-sm">Address</Label>
                        <Input
                            id="userAddress"
                            name="userAddress"
                            value={isEditing ? editableUser.userAddress || '' : user.userAddress || ''}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            className="text-xs sm:text-sm md:text-base"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#e5ded7] shadow-xl">
                <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white p-4 sm:p-6">
                    <CardTitle className="text-[#5c3d28] flex items-center text-base sm:text-lg md:text-xl">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#a4785a]" />
                        Account Management
                    </CardTitle>
                    <CardDescription className="text-[#7b5a3b] text-xs sm:text-sm">Manage your account status and data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 md:space-y-6 pt-4 sm:pt-6 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border-2 border-[#e5ded7] rounded-lg sm:rounded-xl hover:border-yellow-400 transition-all duration-200 bg-gradient-to-r from-white to-[#faf9f8]">
                        <div className="flex-1">
                            <p className="font-semibold text-[#5c3d28] text-sm sm:text-base">Deactivate Account</p>
                            <span className="text-xs sm:text-sm text-[#7b5a3b]">Temporarily disable your account</span>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={handleDeactivate}
                            className="border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 transition-all duration-200 w-full sm:w-auto text-xs sm:text-sm"
                        >
                            Deactivate
                        </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border-2 border-red-200 rounded-lg sm:rounded-xl hover:border-red-400 transition-all duration-200 bg-gradient-to-r from-red-50 to-white">
                        <div className="flex-1">
                            <p className="font-semibold text-red-700 text-sm sm:text-base">Delete Account</p>
                            <span className="text-xs sm:text-sm text-red-600">Permanently delete your account and all data</span>
                        </div>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto text-xs sm:text-sm"
                        >
                            <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfilePage;