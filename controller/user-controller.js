const { StatusCodes } = require("http-status-codes");
const { UserService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils");

async function register(req, res) {
    try {
        const user = await UserService.registerUser(req.body);
        SuccessResponse.data = user;
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function login(req, res) {
    try {
        const token = await UserService.authenticateUser(req.body);
        SuccessResponse.data = { token };
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        console.log(error)
        ErrorResponse.error = error;
        ErrorResponse.status = error.statusCode
        return res.status(error.statusCode).json(ErrorResponse);
    }
}

async function getProjects(req, res) {
    try {
        const project = await UserService.getProjects(req.user);
        SuccessResponse.data = project;
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
}
async function getProject(req, res) {
    try {
        const project = await UserService.getProject(req.user,req.params.id);
        SuccessResponse.data = project;
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
}

async function createProject(req, res) {
    try {
        const project = await UserService.createProject(req.user, req.body);
        SuccessResponse.data = project;
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.UNAUTHORIZED).json(ErrorResponse);
    }
}

async function addEnvVar(req, res) {
    try {
        const envVar = await UserService.addEnvVar(req.user, req.params.id, req.body);
        SuccessResponse.data = envVar;
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
}
async function getDeploymentLogs(req, res) {
    try {

        const logs = await UserService.getDeploymentLogs(req.user, req.params.id);
        SuccessResponse.data = logs;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
}
async function me(req, res) {
    try {
        const user = await UserService.me(req.user);
        if (user) {
            SuccessResponse.data = user;
            return res.status(StatusCodes.OK).json(SuccessResponse);
        } else {
            ErrorResponse.error = "Not such user found.";
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
        }
    } catch (error) {
        console.log(error);
        ErrorResponse.error = error.message;
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
}

module.exports = {
    register,
    login,
    createProject,
    addEnvVar,
    getDeploymentLogs,
    getProject,
    getProjects,
    me
};
