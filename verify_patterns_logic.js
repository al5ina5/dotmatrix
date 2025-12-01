const patterns = {
    '↑': [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 0, 1, 0, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
    ],
    '↓': [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 0, 1, 0, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
    ],
    ' ': [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
    ]
};

function getPattern(char) {
    return patterns[char] || patterns[' '];
}

function verifyPatterns() {
    console.log('Verifying Arrow Patterns...');

    const upArrow = getPattern('↑');
    const downArrow = getPattern('↓');

    console.log('Up Arrow Pattern Found:', upArrow.length === 7 && upArrow[0].length === 5);
    console.log('Down Arrow Pattern Found:', downArrow.length === 7 && downArrow[0].length === 5);

    const space = getPattern(' ');
    const isUpDifferent = JSON.stringify(upArrow) !== JSON.stringify(space);
    const isDownDifferent = JSON.stringify(downArrow) !== JSON.stringify(space);

    console.log('Up Arrow is distinct from Space:', isUpDifferent);
    console.log('Down Arrow is distinct from Space:', isDownDifferent);

    if (isUpDifferent && isDownDifferent) {
        console.log('SUCCESS: Arrow patterns are correctly defined.');
    } else {
        console.error('FAILURE: Arrow patterns are missing or incorrect.');
    }
}

verifyPatterns();
