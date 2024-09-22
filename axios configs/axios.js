import axios from "axios";
import { toast } from "react-toastify";

// 1. Create an Axios instance
const api = axios.create({
	baseURL: process.env.REACT_APP_API_BASE_URL,
	timeout: 10000,
});

// 2. Request Interceptor
api.interceptors.request.use(
	(config) => {
		// Modify config before sending request (to add the token)
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// 3. Response Interceptor
api.interceptors.response.use(
	(response) => {
		return response.data;
	},
	(error) => {
		const status = error.response?.status;
		if (status === 401) {
			toast.error("Unauthorized. Please log in again.");
			// Logic for redirecting to login, etc.
		} else if (status >= 500) {
			toast.error("Server error. Please try again later.");
		} else if (status >= 400) {
			toast.error(error.response.data.message || "Something went wrong.");
		}
		return Promise.reject(error);
	}
);

// Dynamic Axios Request Function
const makeRequest = async ({
	method = "GET", // Default value for method if none is provided
	url = "",
	data = null,
	headers = {},
	params = {}, // For query parameters
	toastMessages = { success: "", error: "" },
}) => {
	try {
		const config = {
			method,
			url,
			headers,
			params,
			data,
		};

		const response = await api(config);

		// Success toast
		if (toastMessages.success) {
			toast.success(toastMessages.success);
		}

		return response;
	} catch (error) {
		// Error toast (already handled in the interceptor, but can add more here if needed)
		if (toastMessages.error) {
			toast.error(toastMessages.error);
		}
		throw error;
	}
};

export default makeRequest;
