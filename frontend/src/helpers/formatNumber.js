const formatNumber = (number) => {
    const string = String(Math.abs(number));
    const dotIndex = string.indexOf(".");
    const length = dotIndex === -1 ? string.length : dotIndex;

    if (length <= 3) {
        return string;
    }

    let newString = "";
    for (let i = length; i >= 4; i -= 3) {
        const index = length - i;
        const step = (i - 1) % 3 + 1;

        if (i === length) {
            newString = string.slice(index, index + step);
        }

        newString = `${newString},${string.slice(index + step, index + step + 3)}`;
    }

    if (dotIndex !== -1) {
        newString = `${newString}${string.slice(dotIndex, string.length)}`;
    }

    if (number < 0) {
        newString = `-${newString}`;
    }
    
    return newString;
};

export default formatNumber;