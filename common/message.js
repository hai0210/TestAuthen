const errorMessage = {
    PASSWORD_SHOULD_NOT_AS_EMAIL: "Your password should not be the same as your email",
    PASSWORD_NOT_MATCH: "Password and confirmation password is not match",
    PASSWORD_EMPTY: "Password or/and confirmation password should not be empty",
    PASSWORD_NOT_MEET_COMPLEXITY: "Your password must contain at least one upper key, one lower key, one number and one of following special character '!', '@', '#', '$', '%', '&', '*', '(', ')', and at least 6 characters",
    PASSWORD_CURRENT_INCORRECT: "Your current password is incorrect please try again",
    PASSWORD_SHOULD_NOT_AS_OLD: "Your new password should not be the same as your old password",
    EMAIL_EMPTY: "Email should not be empty",
    EMAIL_NOT_VALID: "Your email is not valid, please check it again. Ex: youremail@example.com",
    EMAIL_EXIST: "This email is already exist on the system",
    FETCH_USER_ERROR: "Some error happen while fetching user",
    EDIT_PROFILE_FAIL: "Failed to update to database",
    RESET_PASSWORD_FAIL: "There some error while create reset password link",
}

const successMessage = {
    EDIT_PROFILE: "Edit profile successful",
    CHANGE_PASSWORD: "Your password is updated",
    REGISTER_USER: "Your account is register successful. Please check your's register email to verify an account.",
    LOGIN: "Login successful. Welcome to ours OAuth2 Server.",
    RESET_PASSWORD_URL: "Check your email address to reset your password",
}
module.exports = {
    errorMessage,
    successMessage
}
