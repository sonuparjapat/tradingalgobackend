export const checkTokenExpiry = (req, res, next) => {
    if (!accessToken) {
        return res.status(401).json({ message: 'Token expired or not available, please log in again.' });
    }
    next();
};