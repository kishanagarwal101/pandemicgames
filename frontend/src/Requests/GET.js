const GET = async (path) => {
    try {
        const response = await fetch(path);
        const parsedJSON = await response.json();
        return parsedJSON;
    }
    catch (err) {
        console.error(err);
    }
}
export default GET;