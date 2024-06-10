const { z } = require('zod');
const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils');
const urlPattern = new RegExp('^(https?:\\/\\/)?(www\\.)?github\\.com\\/[A-Za-z0-9_.-]+\\/[A-Za-z0-9_.-]+(\\/)?$');
const userRegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string(),
    lastName: z.string()
});

const userLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

const envVariableSchema = z.object({
    key: z.string().min(1, 'Key cannot be empty'),
    value: z.string().min(1, 'Value cannot be empty')
});

const projectSchema = z.object({
    gitURL: z.string().regex(urlPattern, 'Invalid GitHub URL'),
    envVariables: z.array(envVariableSchema).optional()
});


const envVarSchema = z.object({
    key: z.string().min(1),
    value: z.string().min(1)
});

function formatZodError(issues) {
    return issues.map(issue => `${issue.path.join('.')} - ${issue.message}`).join(', ');
}

function validateRegister(req, res, next) {
    const result = userRegisterSchema.safeParse(req.body);
    if (!result.success) {
        ErrorResponse.error = formatZodError(result.error.issues);
        ErrorResponse.status = StatusCodes.BAD_REQUEST;
        ErrorResponse.success = false;
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

function validateLogin(req, res, next) {
    const result = userLoginSchema.safeParse(req.body);
    if (!result.success) {
        ErrorResponse.error = formatZodError(result.error.issues);
        ErrorResponse.status = StatusCodes.BAD_REQUEST;
        ErrorResponse.success = false;
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

function validateCreateProject(req, res, next) {
    const result = projectSchema.safeParse(req.body);
    if (!result.success) {
        ErrorResponse.error = formatZodError(result.error.issues);
        ErrorResponse.status = StatusCodes.BAD_REQUEST;
        ErrorResponse.success = false;
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

function validateEnvVar(req, res, next) {
    const result = envVarSchema.safeParse(req.body);
    if (!result.success) {
        ErrorResponse.error = formatZodError(result.error.issues);
        ErrorResponse.status = StatusCodes.BAD_REQUEST;
        ErrorResponse.success = false;
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

module.exports = {
    validateRegister,
    validateLogin,
    validateCreateProject,
    validateEnvVar
};
