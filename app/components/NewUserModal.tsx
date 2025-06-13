/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/app/contexts/authContext';
import { z } from 'zod';
import { axiosInstance } from '../utils/api';

// Zod validation schema
const userProfileSchema = z.object({
    username: z
        .string()
        .min(1, 'Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .regex(/^[a-zA-Z0-9][a-zA-Z0-9_@.]*$/, 'Username must start with letter or number and can only contain letters, numbers, @, underscores, and dots'),
    firstName: z
        .string()
        .max(50, 'First name must be less than 50 characters')
        .optional(),
    lastName: z
        .string()
        .max(50, 'Last name must be less than 50 characters')
        .optional(),
    bio: z
        .string()
        .max(500, 'Bio must be less than 500 characters')
        .optional()
});

// Type inference from Zod schema
type UserProfileForm = z.infer<typeof userProfileSchema>;

// Error state type
interface FormErrors {
    username?: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    submit?: string;
}

// Saved profile data type
interface SavedProfileData {
    username: string;
    first_name: string | null;
    last_name: string | null;
    bio: string | null;
    completed_at: string;
}

export default function NewUserModal(): JSX.Element {
    const { user } = useAuth();
    const [open, setOpen] = useState<boolean>(false);

    const [username, setUsername] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [bio, setBio] = useState<string>('');

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            console.log('NewUserModal user:', user);

            // Check if user has previously declined
            const hasDeclined = localStorage.getItem('userProfileDeclined');
            const hasCompleted = localStorage.getItem('userProfile');

            // Only show modal if user is new and hasn't declined or completed before
            if (user?.new_user && !hasDeclined && !hasCompleted) {
                setOpen(true);
                // Pre-fill username if available
                if (user?.username) {
                    setUsername(user.username);
                }
            }
        }, 1000); // Delay of 1 second

        return () => clearTimeout(timer); // Cleanup on unmount
    }, []);

    const validateForm = (): boolean => {
        try {
            userProfileSchema.parse({
                username: username.trim(),
                firstName: firstName.trim() || undefined,
                lastName: lastName.trim() || undefined,
                bio: bio.trim() || undefined
            });
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: FormErrors = {};
                error.errors.forEach((err) => {
                    const field = err.path[0] as keyof FormErrors;
                    newErrors[field] = err.message;
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleSubmit = async (): Promise<void> => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Save to localStorage
            const profileData: SavedProfileData = {
                username: username.trim(),
                first_name: firstName.trim() || null,
                last_name: lastName.trim() || null,
                bio: bio.trim() || null,
                completed_at: new Date().toISOString()
            };

            localStorage.setItem('userProfile', JSON.stringify(profileData));

            //  send to server
            const response = await axiosInstance.put('/user/update', {
                username: profileData.username,
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                bio: profileData.bio
            });
            
            console.log('Profile saved successfully:', response.data);

            setOpen(false);
        } catch (err) {
            console.error('Error saving profile:', err);
            setErrors({ submit: 'Failed to save profile. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDecline = (): void => {
        // Save decline status to localStorage (simple flag)
        localStorage.setItem('userProfileDeclined', 'true');
        setOpen(false);
    };

    const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/^@|[^a-zA-Z0-9_@.]/g, '');
        setUsername(value);
        // Clear username error when user starts typing
        try {
            const resposne = await axiosInstance.get(`/user/check-username?username=${value}`);

            const result = resposne.data.data as boolean;
            if (result && value !== user?.username) { // If data is false, username is taken
                setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
            } else {
                setErrors(prev => ({ ...prev, username: undefined }));
            }
            console.log('Username check response:', resposne.data);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.errors[0].message;
                setErrors(prev => ({ ...prev, username: errorMessage }));
            }
        }


        if (errors.username) {
            setErrors(prev => ({ ...prev, username: undefined }));
        }
    };

    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setFirstName(e.target.value);
        if (errors.firstName) {
            setErrors(prev => ({ ...prev, firstName: undefined }));
        }
    };

    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setLastName(e.target.value);
        if (errors.lastName) {
            setErrors(prev => ({ ...prev, lastName: undefined }));
        }
    };

    const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setBio(e.target.value);
        if (errors.bio) {
            setErrors(prev => ({ ...prev, bio: undefined }));
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Welcome! Please fill in your personal information</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Username - Required */}
                    <div>
                        <Label htmlFor="username">
                            Username <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder="Enter your username"
                            className={errors.username ? 'border-red-500' : ''}
                            maxLength={20}
                        />
                        {errors.username && (
                            <p className="text-sm text-red-500 mt-1 dark:text-red-500">{errors.username}</p>
                        )}
                    </div>

                    {/* First Name - Optional */}
                    <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            value={firstName}
                            onChange={handleFirstNameChange}
                            placeholder="Enter your first name (optional)"
                            className={errors.firstName ? 'border-red-500' : ''}
                            maxLength={50}
                        />
                        {errors.firstName && (
                            <p className="text-sm text-red-500 mt-1 dark:text-red-500">{errors.firstName}</p>
                        )}
                    </div>

                    {/* Last Name - Optional */}
                    <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            value={lastName}
                            onChange={handleLastNameChange}
                            placeholder="Enter your last name (optional)"
                            className={errors.lastName ? 'border-red-500' : ''}
                            maxLength={50}
                        />
                        {errors.lastName && (
                            <p className="text-sm text-red-500 mt-1 dark:text-red-500">{errors.lastName}</p>
                        )}
                    </div>

                    {/* Bio - Optional */}
                    <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            rows={3}
                            value={bio}
                            onChange={handleBioChange}
                            placeholder="Tell us about yourself... (optional)"
                            className={errors.bio ? 'border-red-500' : ''}
                            maxLength={500}
                        />
                        <div className="flex justify-between items-center mt-1">
                            {errors.bio && (
                                <p className="text-sm text-red-500 dark:text-red-500">{errors.bio}</p>
                            )}
                            <p className="text-sm text-gray-500 ml-auto">
                                {bio.length}/500
                            </p>
                        </div>
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-sm text-red-600 dark:text-red-500">{errors.submit}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-6 gap-2">
                    <Button variant="outline" onClick={handleDecline} disabled={isSubmitting}>
                        Skip for now
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Information'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}