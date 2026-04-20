import { formatarDuracao } from '@utils/tempo';
import { useMemo } from 'react';

const GraficoHoras = ({ dias = [] }) => {
    const { apontadoMin, naoApontadoMin, total } = useMemo(() => {
        let apontadoMin = 0;
        let naoApontadoMin = 0;

        dias.forEach((dia) => {
            const tarefas = dia.tarefas || [];

            tarefas.forEach((tarefa) => {
                const min = tarefa.duracaoMin || 0;

                if (tarefa.apontado) {
                    apontadoMin += min;
                } else {
                    naoApontadoMin += min;
                }
            });
        });

        return {
            apontadoMin,
            naoApontadoMin,
            total: apontadoMin + naoApontadoMin,
        };
    }, [dias]);

    if (dias.length === 0) return null;
    if (total === 0) return null;

    const pctApontado = apontadoMin / total;
    const pctNaoApontado = naoApontadoMin / total;

    const cx = 80;
    const cy = 80;
    const r = 65;
    const innerR = 38;

    const polarToCartesian = (cx, cy, r, angleDeg) => {
        const angle = (angleDeg - 90) * (Math.PI / 180);
        return {
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle),
        };
    };

    const describeArc = (cx, cy, r, innerR, startAngle, endAngle) => {
        const start = polarToCartesian(cx, cy, r, endAngle);
        const end = polarToCartesian(cx, cy, r, startAngle);
        const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
        const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return [
            `M ${start.x} ${start.y}`,
            `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
            `L ${innerEnd.x} ${innerEnd.y}`,
            `A ${innerR} ${innerR} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
            'Z',
        ].join(' ');
    };

    const apontadoAngle = pctApontado * 360;
    const naoApontadoAngle = pctNaoApontado * 360;

    const apontadoEnd = apontadoAngle >= 360 ? 359.99 : apontadoAngle;
    const naoApontadoEnd = naoApontadoAngle >= 360 ? 359.99 : naoApontadoAngle;

    return (
        <section className="card">
            <h2 className="section-title" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="section-icon">
                    <svg className="icon-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                </div>
                Horas do Período
            </h2>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xl)',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
                    {naoApontadoMin > 0 && (
                        <path
                            d={describeArc(cx, cy, r, innerR, 0, naoApontadoEnd)}
                            fill="var(--secondary-color)"
                            opacity="0.85"
                        />
                    )}

                    {apontadoMin > 0 && (
                        <path
                            d={describeArc(cx, cy, r, innerR, naoApontadoAngle, naoApontadoAngle + apontadoEnd)}
                            fill="var(--primary-color)"
                            opacity="0.9"
                        />
                    )}

                    <text
                        x={cx}
                        y={cy - 8}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="700"
                        fill="var(--gray-900)"
                    >
                        {Math.round(pctApontado * 100)}%
                    </text>
                    <text
                        x={cx}
                        y={cy + 10}
                        textAnchor="middle"
                        fontSize="10"
                        fill="var(--gray-500)"
                    >
                        apontado
                    </text>
                </svg>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <div
                            style={{
                                width: 14,
                                height: 14,
                                borderRadius: '3px',
                                background: 'var(--primary-color)',
                                flexShrink: 0,
                            }}
                        />
                        <div>
                            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-600)', margin: 0 }}>
                                Apontado
                            </p>
                            <p style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
                                {formatarDuracao(apontadoMin)}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <div
                            style={{
                                width: 14,
                                height: 14,
                                borderRadius: '3px',
                                background: 'var(--secondary-color)',
                                flexShrink: 0,
                            }}
                        />
                        <div>
                            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-600)', margin: 0 }}>
                                Não apontado
                            </p>
                            <p style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
                                {formatarDuracao(naoApontadoMin)}
                            </p>
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop: 'var(--spacing-xs)',
                            paddingTop: 'var(--spacing-sm)',
                            borderTop: '1px solid var(--gray-200)',
                        }}
                    >
                        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-500)', margin: 0 }}>Total</p>
                        <p style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--primary-color)', margin: 0 }}>
                            {formatarDuracao(total)}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GraficoHoras;