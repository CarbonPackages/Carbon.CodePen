export const objectIsEmpty = (obj: object) => {
    for (var _key in obj) {
        return false;
    }
    return true;
};
