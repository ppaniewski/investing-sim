const errorHandler = (err, req, res, next) => {
    const statusCode = (!res.statusCode || res.statusCode == 200) ? 500 : res.statusCode;
    const isServerError = statusCode >= 500;
    
    res.status(statusCode).json({
        success: false,
        message: (isServerError && process.env.NODE_ENV !== "development") ? "Server error" : err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined 
    });
}

export default errorHandler;