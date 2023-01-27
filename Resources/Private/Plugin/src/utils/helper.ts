export const objectIsEmpty = (obj: object) => {
    for (const _key in obj) {
        return false;
    }
    return true;
};
