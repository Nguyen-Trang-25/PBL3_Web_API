export function attachCreateRequestHandler(requestData) {
    try {
        const response = await fetch("https://localhost:7051/Request/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}` // Nếu cần xác thực
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Lỗi khi gửi yêu cầu.");
        }   

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("API lỗi:", error.message);
        throw error;
    }
}