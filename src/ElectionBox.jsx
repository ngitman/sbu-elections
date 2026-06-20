import React, { useState, useEffect } from 'react';

const ElectionBox = ({ pos, candidates, parties, noConfidence, totalVotesOverride }) => {
    const [totalVotes, setTotalVotes] = useState(0);
    const [winners, setWinners] = useState([]);
    const MAX_SENATORS = 23;

    const filteredCandidates = candidates.filter(c =>
        noConfidence || !['NC', 'No Confidence'].includes(c.name)
    );

    useEffect(() => {
        if (pos !== 'Senators') {
            const votes = filteredCandidates.reduce((sum, c) => sum + c.votes, 0);
            setWinners([filteredCandidates[0]?.name || '']);
            setTotalVotes(votes);
        } else {
            const elected = filteredCandidates.slice(0, MAX_SENATORS).map(c => c.name);
            setWinners(elected);
            setTotalVotes(filteredCandidates.reduce((sum, c) => sum + c.votes, 0));
        }
    }, [filteredCandidates, pos]);

    const pctOfTotal = (votes) => {
        const base = totalVotesOverride || totalVotes;
        return base > 0 ? ((votes / base) * 100).toFixed(1) : '0.0';
    };

    const getPartyColor = (candidate) => {
        if (!candidate.party) return '#c6c6cd';
        if (candidate.party === 'NC') return '#45464d';
        const party = parties?.find(p => p.name === candidate.party);
        return party ? party.color : '#c6c6cd';
    };

    // Senators: ranked list with cutoff line
    if (pos === 'Senators') {
        const NC_NAMES = ['NC', 'No Confidence'];
        const isNC = (c) => NC_NAMES.includes(c.party) || NC_NAMES.includes(c.name);
        const ranked = filteredCandidates; // already sorted by votes desc

        // Find effective cutoff: within top MAX_SENATORS slots, NC occupies a slot
        // so any candidate at position >= MAX_SENATORS is not elected.
        // Additionally, if NC appears at position i < MAX_SENATORS, candidates
        // ranked below NC (i+1 .. MAX_SENATORS-1) are also not elected.
        const ncIndexInTop = ranked.findIndex((c, i) => i < MAX_SENATORS && isNC(c));
        const cutoff = ncIndexInTop !== -1 ? ncIndexInTop : MAX_SENATORS;

        return (
            <div style={{ padding: '20px 24px', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {ranked.map((c, i) => {
                        const nc = isNC(c);
                        const isElected = !nc && i < cutoff;
                        const color = getPartyColor(c);
                        const pct = parseFloat(pctOfTotal(c.votes));
                        const maxVotes = ranked[0]?.votes || 1;
                        const barWidth = (c.votes / maxVotes) * 100;
                        const isCutoffBoundary = i === cutoff;

                        return (
                            <React.Fragment key={i}>
                                {isCutoffBoundary && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0', opacity: 0.7 }}>
                                        <div style={{ flex: 1, height: 1, background: '#c6c6cd', borderTop: '1px dashed #76777d' }} />
                                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#76777d', whiteSpace: 'nowrap' }}>
                                            {ncIndexInTop !== -1 ? 'Displaced by No Confidence' : `Seat ${cutoff} / Not Elected`}
                                        </span>
                                        <div style={{ flex: 1, height: 1, borderTop: '1px dashed #76777d' }} />
                                    </div>
                                )}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '6px 0',
                                    opacity: isElected || nc ? 1 : 0.45,
                                }}>
                                    {/* Rank */}
                                    <span style={{ fontSize: 11, color: '#76777d', width: 20, textAlign: 'right', flexShrink: 0 }}>
                                        {i + 1}
                                    </span>
                                    {/* Party color pip */}
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                                    {/* Name */}
                                    <span style={{
                                        fontSize: 13,
                                        fontWeight: isElected || nc ? 600 : 400,
                                        color: isElected || nc ? '#191c1e' : '#76777d',
                                        width: 180,
                                        flexShrink: 0,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>
                                        {c.name}{c.incumbent ? '*' : ''}
                                    </span>
                                    {/* Bar */}
                                    <div style={{ flex: 1, height: 4, background: '#eceef0', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${barWidth}%`, background: color, borderRadius: 2, transition: 'width 0.4s ease' }} />
                                    </div>
                                    {/* Pct */}
                                    <span style={{ fontSize: 12, fontWeight: 600, color: isElected ? color : '#76777d', width: 44, textAlign: 'right', flexShrink: 0 }}>
                                        {pct}%
                                    </span>
                                    {/* Votes */}
                                    <span style={{ fontSize: 12, color: '#76777d', width: 48, textAlign: 'right', flexShrink: 0 }}>
                                        {c.votes}
                                    </span>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #eceef0', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#76777d' }}>Total Votes Cast</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#191c1e' }}>{totalVotesOverride || totalVotes}</span>
                </div>
            </div>
        );
    }

    // Exec positions: progress bar layout matching wireframe
    return (
        <div style={{ padding: '20px 24px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {filteredCandidates.map((c, i) => {
                    const isWinner = winners.includes(c.name);
                    const pct = parseFloat(pctOfTotal(c.votes));
                    const color = getPartyColor(c);

                    return (
                        <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{
                                                fontSize: 15,
                                                fontWeight: isWinner ? 700 : 400,
                                                color: isWinner ? '#191c1e' : '#45464d',
                                                lineHeight: 1.3
                                            }}>
                                                {c.name}{c.incumbent ? '*' : ''}
                                            </span>
                                            {isWinner && <span style={{ fontSize: 13 }}>✅</span>}
                                        </div>
                                        {c.party && (
                                            <span style={{ fontSize: 12, color: color, fontWeight: 600 }}>
                                                {c.party}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: 22,
                                        fontWeight: 600,
                                        lineHeight: '28px',
                                        color: color
                                    }}>
                                        {pct}%
                                    </div>
                                    <div style={{ fontSize: 12, color: '#76777d' }}>{c.votes} votes</div>
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div style={{ width: '100%', height: 6, background: '#eceef0', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${pct}%`,
                                    background: color,
                                    borderRadius: 4,
                                    transition: 'width 0.5s ease',
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #eceef0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#76777d' }}>Total Votes</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#191c1e' }}>{totalVotes}</span>
            </div>
        </div>
    );
};

export default ElectionBox;
