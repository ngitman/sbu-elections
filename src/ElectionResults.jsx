import React, { useEffect, useState } from 'react'
import { Select, MenuItem, Switch } from '@mui/material';
import ElectionBox from './ElectionBox';
import { useNavigate, useParams } from 'react-router-dom';

const dataAvailability = [2024, 2025, 2026];

const ElectionResults = () => {
    const latest = dataAvailability[dataAvailability.length - 1];
    const yearParam = useParams().year;
    const electionYear = yearParam ? Number(yearParam) : latest;
    const [metadata, setMetadata] = useState({});
    const [races, setRaces] = useState({});
    const [showNc, setShowNc] = useState(true);

    const navigate = useNavigate();
    useEffect(() => {
        const openData = async () => {
            const res = await fetch(`/electiondata/${electionYear}.json`);
            const d = await res.json();
            const { Metadata, ...positions } = d;
            setMetadata(Metadata);
            setRaces(positions);
        }
        openData();
    }, [electionYear]);

    const MAX_SENATORS = 23;
    const positionKeys = Object.keys(races);
    const senatorKey = positionKeys.find(k => k === 'Senators');
    const execKeys = positionKeys.filter(k => k !== 'Senators');
    const presidentialTotal = (() => {
        const firstRace = Object.values(races)[0];
        if (!firstRace) return 0;
        return firstRace.reduce((s, c) => s + c.votes, 0);
    })();

    const NC_SKIP = ['NC', 'No Confidence'];
    const isNc = (c) => NC_SKIP.includes(c.party) || NC_SKIP.includes(c.name);

    // Close-race detection: margin between top-2 non-NC candidates as % of race total
    const getCloseRaceInfo = (pos) => {
        const cands = races[pos];
        if (!cands || pos === 'Senators') return null;
        const sorted = cands.slice().sort((a, b) => b.votes - a.votes);
        const nonNc = sorted.filter(c => !isNc(c));
        if (nonNc.length < 2) return null;
        const total = sorted.reduce((s, c) => s + c.votes, 0);
        if (total <= 0) return null;
        const margin = nonNc[0].votes - nonNc[1].votes;
        const marginPct = (margin / total) * 100;
        if (marginPct >= 5) return null;
        return { margin, marginPct };
    };

    return (
        <main style={{ minHeight: '100vh', background: '#f7f9fb', fontFamily: 'Inter, sans-serif' }}>

            {/* Page Header */}
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 48 }}>
                    <div>
                        <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: '56px', letterSpacing: '-0.02em', color: '#191c1e' }}>
                            {electionYear} Election Results
                        </h1>
                        <p style={{ fontSize: 18, color: '#45464d', marginTop: 8 }}>
                            Stony Brook University Undergraduate Student Government
                        </p>
                        <a
                            href="https://www.instagram.com/stonybrookusg/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 13, color: '#0051d5', marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                            Data Source: @stonybrookusg ↗
                        </a>
                    </div>

                </div>

                {/* Controls */}
                <div style={{ background: '#ffffff', border: '1px solid #c6c6cd', borderRadius: 8, padding: '20px 24px', marginBottom: 32, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#45464d', marginBottom: 8 }}>
                            Election Year
                        </label>
                        <Select
                            value={electionYear}
                            onChange={e => navigate(`/${e.target.value}`)}
                            size="small"
                            sx={{
                                fontFamily: 'Inter, sans-serif',
                                bgcolor: 'white',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c6c6cd' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#76777d' },
                            }}
                        >
                            {dataAvailability.map((da, i) => (
                                <MenuItem key={i} value={da} style={{ fontFamily: 'Inter, sans-serif' }}>{da}</MenuItem>
                            ))}
                        </Select>
                    </div>
                    <div style={{ flex: '1 1 260px' }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#45464d', marginBottom: 8 }}>
                            Display Options
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f2f4f6', borderRadius: 6, padding: '8px 14px', border: '1px solid #e6e8ea' }}>
                            <span style={{ fontSize: 14, color: '#191c1e' }}>Show "No Confidence" Votes</span>
                            <Switch
                                checked={showNc}
                                onChange={() => setShowNc(prev => !prev)}
                                size="small"
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#0051d5' },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0051d5' },
                                }}
                            />
                        </div>
                    </div>
                    {/* Party Legend */}
                    {metadata?.parties?.length > 0 && (
                        <div style={{ flex: '1 1 260px' }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#45464d', marginBottom: 8 }}>
                                Parties
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                                {metadata.parties.map((p, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 28, height: 8, borderRadius: 4, background: p.color }} />
                                        <span style={{ fontSize: 13, color: '#45464d' }}>{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bento Grid — Exec Races */}
                {execKeys.length > 0 && (
                    <>
                        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#45464d', marginBottom: 16 }}>
                            Executive Positions
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24, marginBottom: 24 }}>
                            {execKeys.map((pos, i) => {
                                const span = execKeys.length === 1 ? 12 : execKeys.length === 2 ? 6 : i === 0 ? 8 : 4;
                                const closeInfo = getCloseRaceInfo(pos);
                                return (
                                    <div key={`${pos}-${showNc}`} style={{ gridColumn: `span ${span}` }}>
                                        <div style={{ background: '#ffffff', border: '1px solid #c6c6cd', borderRadius: 8, overflow: 'hidden' }}>
                                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #eceef0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                <h2 style={{ fontSize: 24, fontWeight: 600, lineHeight: '32px', color: '#191c1e', margin: 0 }}>{pos}</h2>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                                    {closeInfo && (
                                                        <span title={`Margin: ${closeInfo.marginPct.toFixed(1)}%`} style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', background: '#fff4d6', color: '#8a5a00', padding: '4px 10px', borderRadius: 4, border: '1px solid #f0c75e' }}>
                                                            CLOSE RACE — DECIDED BY {closeInfo.margin} VOTES
                                                        </span>
                                                    )}
                                                    <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', background: '#eceef0', color: '#45464d', padding: '4px 10px', borderRadius: 4 }}>
                                                        Final Results
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ padding: '0 8px' }}>
                                                <ElectionBox
                                                    pos={pos}
                                                    candidates={races[pos].sort((a, b) => b.votes - a.votes)}
                                                    parties={metadata.parties}
                                                    noConfidence={showNc}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Senators — Full Width */}
                {senatorKey && (
                    <>
                        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#45464d', marginBottom: 16 }}>
                            Senate
                        </div>
                        <div style={{ background: '#ffffff', border: '1px solid #c6c6cd', borderRadius: 8, overflow: 'hidden', marginBottom: 64 }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #eceef0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: 24, fontWeight: 600, lineHeight: '32px', color: '#191c1e', margin: 0 }}>Senators</h2>
                                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', background: '#eceef0', color: '#45464d', padding: '4px 10px', borderRadius: 4 }}>
                                    Final Results
                                </span>
                            </div>
                            <div style={{ padding: '0 8px' }}>
                                <ElectionBox
                                    pos={senatorKey}
                                    candidates={races[senatorKey].sort((a, b) => b.votes - a.votes)}
                                    parties={metadata.parties}
                                    noConfidence={showNc}
                                    totalVotesOverride={presidentialTotal}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Dark Stats Section */}
            <section style={{ background: '#131b2e', padding: '64px 0' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #2d3133', paddingBottom: 32, marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <h2 style={{ fontSize: 32, fontWeight: 600, lineHeight: '40px', letterSpacing: '-0.01em', color: '#ffffff', margin: 0 }}>
                                Election Overview
                            </h2>
                            <p style={{ fontSize: 16, color: '#7c839b', marginTop: 8 }}>
                                Summary statistics for the {electionYear} USG election cycle
                            </p>
                        </div>
                        <a
                            href="https://www.instagram.com/stonybrookusg/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: '8px 20px', border: '1px solid #2d3133', color: '#ffffff', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', borderRadius: 4, textDecoration: 'none', background: 'transparent' }}
                        >
                            VIEW SOURCE ↗
                        </a>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
                        {/* Total Races */}
                        <div style={{ padding: 24, background: '#0f172a', border: '1px solid #2d3133', borderRadius: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7c839b', display: 'block', marginBottom: 8 }}>
                                Total Races
                            </span>
                            <div style={{ fontSize: 48, fontWeight: 700, lineHeight: '56px', letterSpacing: '-0.02em', color: '#ffffff' }}>
                                {positionKeys.length}
                            </div>
                            <div style={{ fontSize: 12, color: '#7c839b', marginTop: 8 }}>Positions contested</div>
                        </div>

                        {/* Total Candidates */}
                        <div style={{ padding: 24, background: '#0f172a', border: '1px solid #2d3133', borderRadius: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7c839b', display: 'block', marginBottom: 8 }}>
                                Total Candidates
                            </span>
                            <div style={{ fontSize: 48, fontWeight: 700, lineHeight: '56px', letterSpacing: '-0.02em', color: '#ffffff' }}>
                                {Object.values(races).reduce((sum, arr) => sum + arr.length, 0)}
                            </div>
                            <div style={{ fontSize: 12, color: '#7c839b', marginTop: 8 }}>Across all positions</div>
                        </div>

                        {/* Total Votes Cast */}
                        <div style={{ padding: 24, background: '#0f172a', border: '1px solid #2d3133', borderRadius: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7c839b', display: 'block', marginBottom: 8 }}>
                                Votes Cast
                            </span>
                            <div style={{ fontSize: 48, fontWeight: 700, lineHeight: '56px', letterSpacing: '-0.02em', color: '#ffffff' }}>
                                {(() => {
                                    const SKIP = ['NC', 'No Confidence'];
                                    const firstRace = Object.values(races)[0];
                                    if (!firstRace) return '—';
                                    const total = firstRace
                                        .filter(c => !SKIP.includes(c.party) && !SKIP.includes(c.name))
                                        .reduce((s, c) => s + c.votes, 0);
                                    return total > 999 ? `${(total / 1000).toFixed(1)}K` : total;
                                })()}
                            </div>
                            <div style={{ fontSize: 12, color: '#7c839b', marginTop: 8 }}>Ballots cast</div>
                        </div>

                        {/* Parties */}
                        <div style={{ padding: 24, background: '#0f172a', border: '1px solid #2d3133', borderRadius: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7c839b', display: 'block', marginBottom: 8 }}>
                                Parties
                            </span>
                            <div style={{ fontSize: 48, fontWeight: 700, lineHeight: '56px', letterSpacing: '-0.02em', color: '#ffffff' }}>
                                {metadata?.parties?.filter(p => !['NC', 'No Confidence', 'Unaffiliated'].includes(p.name)).length ?? '—'}
                            </div>
                            <div style={{ fontSize: 12, color: '#7c839b', marginTop: 8 }}>Competing this cycle</div>
                        </div>
                    </div>

                    {/* Senate Composition */}
                    {senatorKey && races[senatorKey] && metadata?.parties && (
                        <div style={{ marginTop: 48 }}>
                            <h3 style={{ fontSize: 24, fontWeight: 600, color: '#ffffff', marginBottom: 8 }}>Senate Composition</h3>
                            <p style={{ fontSize: 13, color: '#7c839b', marginBottom: 24 }}>Elected seats by party (top {MAX_SENATORS})</p>
                            {(() => {
                                const isNcEntry = (c) => NC_SKIP.includes(c.party) || NC_SKIP.includes(c.name);
                                const sorted = races[senatorKey].slice().sort((a, b) => b.votes - a.votes);
                                const ncIdxInTop = sorted.findIndex((c, i) => i < MAX_SENATORS && isNcEntry(c));
                                const cutoff = ncIdxInTop !== -1 ? ncIdxInTop : MAX_SENATORS;
                                const elected = sorted.slice(0, cutoff).filter(c => !isNcEntry(c));
                                const ncBlocked = ncIdxInTop !== -1 ? (MAX_SENATORS - cutoff) : 0;
                                const vacant = MAX_SENATORS - elected.length - ncBlocked;

                                const seatMap = {};
                                elected.forEach(c => {
                                    const key = (!c.party || c.party === 'Unaffiliated') ? 'Unaffiliated' : c.party;
                                    seatMap[key] = (seatMap[key] || 0) + 1;
                                });
                                if (ncBlocked > 0) seatMap['No Confidence'] = ncBlocked;
                                if (vacant > 0) seatMap['Vacant'] = vacant;
                                const entries = Object.entries(seatMap).sort((a, b) => b[1] - a[1]);

                                return (
                                    <>
                                        {/* Segmented bar */}
                                        <div style={{ display: 'flex', height: 20, borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
                                            {entries.map(([party, seats], i) => {
                                                const p = metadata.parties.find(p => p.name === party);
                                                const color = party === 'Vacant' ? '#2d3133'
                                                    : party === 'No Confidence' ? '#262626'
                                                    : party === 'Unaffiliated' ? '#c6c6cd'
                                                    : p ? p.color : '#76777d';
                                                return (
                                                    <div
                                                        key={i}
                                                        title={`${party}: ${seats} seats`}
                                                        style={{ flex: seats, background: color, borderRight: i < entries.length - 1 ? '2px solid #131b2e' : 'none' }}
                                                    />
                                                );
                                            })}
                                        </div>
                                        {/* Legend */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px' }}>
                                            {entries.map(([party, seats], i) => {
                                                const p = metadata.parties.find(p => p.name === party);
                                                const color = party === 'Vacant' ? '#2d3133'
                                                    : party === 'No Confidence' ? '#262626'
                                                    : party === 'Unaffiliated' ? '#c6c6cd'
                                                    : p ? p.color : '#76777d';
                                                const label = party === 'No Confidence' ? 'Unfilled (No Confidence)' : party;
                                                return (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 12, height: 12, borderRadius: 2, background: color, border: party === 'No Confidence' ? '1px solid #76777d' : 'none' }} />
                                                        <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 600 }}>{seats}</span>
                                                        <span style={{ fontSize: 13, color: '#7c839b' }}>{label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </section>


        </main>
    );
};

export default ElectionResults;
