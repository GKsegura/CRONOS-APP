import { formatarDuracao } from '@utils/tempo';
import { useMemo } from 'react';
import './GraficoHoras.css';

const CX = 80;
const CY = 80;
const R = 65;
const INNER_R = 38;
const GAP_DEG = 2;

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
    const iStart = polarToCartesian(cx, cy, innerR, endAngle);
    const iEnd = polarToCartesian(cx, cy, innerR, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
        `M ${start.x} ${start.y}`,
        `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
        `L ${iEnd.x} ${iEnd.y}`,
        `A ${innerR} ${innerR} 0 ${largeArc} 1 ${iStart.x} ${iStart.y}`,
        'Z',
    ].join(' ');
};

// Para arcos que cobrem 360° (segmento único), dividir em dois semicírculos
// evita o artefato do SVG em que start ≈ end ≈ 0° e o `Z` fecha o path
// com uma linha visível ("pedacinho").
const describeFullRing = (cx, cy, r, innerR) =>
    describeArc(cx, cy, r, innerR, 0, 180) +
    ' ' +
    describeArc(cx, cy, r, innerR, 180, 359.9999);

const GraficoHoras = ({ dias = [] }) => {
    const { apontadoMin, naoApontadoMin, total } = useMemo(() => {
        let apontadoMin = 0;
        let naoApontadoMin = 0;

        dias.forEach(({ tarefas = [] }) => {
            tarefas.forEach(({ duracaoMin = 0, apontado }) => {
                if (apontado) apontadoMin += duracaoMin;
                else naoApontadoMin += duracaoMin;
            });
        });

        return { apontadoMin, naoApontadoMin, total: apontadoMin + naoApontadoMin };
    }, [dias]);

    if (!dias.length || total === 0) return null;

    const pctApontado = apontadoMin / total;

    const hasTwo = apontadoMin > 0 && naoApontadoMin > 0;
    const gap = hasTwo ? GAP_DEG : 0;

    // Distribui os 360° disponíveis menos o gap entre os dois segmentos
    const available = 360 - gap;
    const naoApontadoSpan = (naoApontadoMin / total) * available;
    const apontadoSpan = (apontadoMin / total) * available;

    const naoApontadoEnd = naoApontadoSpan;
    const apontadoStart = naoApontadoSpan + gap;
    const apontadoEnd = apontadoStart + apontadoSpan;

    const naoApontadoPath = naoApontadoMin > 0
        ? describeArc(CX, CY, R, INNER_R, 0, Math.min(naoApontadoEnd, 359.9999))
        : null;

    // Segmento único (100% apontado): usa anel completo dividido em dois semicírculos.
    // Caso contrário, usa o arco normal com clamp de segurança.
    const apontadoPath = apontadoMin > 0
        ? (!hasTwo
            ? describeFullRing(CX, CY, R, INNER_R)
            : describeArc(CX, CY, R, INNER_R, apontadoStart, Math.min(apontadoEnd, 359.9999)))
        : null;

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

            <div className="grafico-horas__content">
                <svg
                    className="grafico-horas__svg"
                    width="160"
                    height="160"
                    viewBox="0 0 160 160"
                >
                    {naoApontadoPath && (
                        <path
                            className="grafico-horas__arc"
                            d={naoApontadoPath}
                            fill="var(--secondary-color)"
                            opacity="0.25"
                        />
                    )}

                    {apontadoPath && (
                        <path
                            className="grafico-horas__arc"
                            d={apontadoPath}
                            fill="var(--primary-color)"
                            opacity="0.9"
                        />
                    )}

                    <text x={CX} y={CY - 8} textAnchor="middle" className="grafico-horas__center-label">
                        {Math.round(pctApontado * 100)}%
                    </text>
                    <text x={CX} y={CY + 10} textAnchor="middle" className="grafico-horas__center-sub">
                        apontado
                    </text>
                </svg>

                <div className="grafico-horas__legend">
                    <div className="grafico-horas__item">
                        <div className="grafico-horas__dot grafico-horas__dot--apontado" />
                        <div>
                            <p className="grafico-horas__item-label">Apontado</p>
                            <p className="grafico-horas__item-value">{formatarDuracao(apontadoMin)}</p>
                        </div>
                    </div>

                    <div className="grafico-horas__item">
                        <div className="grafico-horas__dot grafico-horas__dot--nao-apontado" />
                        <div>
                            <p className="grafico-horas__item-label">Não apontado</p>
                            <p className="grafico-horas__item-value">{formatarDuracao(naoApontadoMin)}</p>
                        </div>
                    </div>

                    <div className="grafico-horas__total">
                        <p className="grafico-horas__total-label">Total</p>
                        <p className="grafico-horas__total-value">{formatarDuracao(total)}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GraficoHoras;