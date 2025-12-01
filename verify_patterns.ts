import { getPattern } from './lib/patterns';

function verifyPatterns() {
    console.log('Verifying Arrow Patterns...');

    const upArrow = getPattern('↑');
    const downArrow = getPattern('↓');

    console.log('Up Arrow Pattern Found:', upArrow.length === 7 && upArrow[0].length === 5);
    console.log('Down Arrow Pattern Found:', downArrow.length === 7 && downArrow[0].length === 5);

    // Check if they are not just empty spaces (which getPattern returns for unknown chars)
    const space = getPattern(' ');
    const isUpDifferent = JSON.stringify(upArrow) !== JSON.stringify(space);
    const isDownDifferent = JSON.stringify(downArrow) !== JSON.stringify(space);

    console.log('Up Arrow is distinct from Space:', isUpDifferent);
    console.log('Down Arrow is distinct from Space:', isDownDifferent);
}

verifyPatterns();
