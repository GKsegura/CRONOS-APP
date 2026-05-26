import './dashboard-graficos.css';

export function GraficoBarras({ titulo, subtitulo, dados = [] }) {
    const maiorValor = Math.max(...dados.map((item) => item.valor), 1);

    return (
        <section className="dashboard-chart-card">
            <header className="dashboard-chart-card__header">
                <div>
                    <h3>{titulo}</h3>
                    {subtitulo && <p>{subtitulo}</p>}
                </div>
            </header>

            <div className="dashboard-chart-card__content">
                {dados.length === 0 ? (
                    <p className="dashboard-chart-card__empty">
                        Nenhum dado encontrado para exibir.
                    </p>
                ) : (
                    dados.map((item) => {
                        const largura = (item.valor / maiorValor) * 100;

                        return (
                            <div className="dashboard-chart-row" key={item.label}>
                                <div className="dashboard-chart-row__info">
                                    <span>{item.label}</span>
                                    <strong>{item.horas.toFixed(2)}h</strong>
                                </div>

                                <div className="dashboard-chart-row__bar">
                                    <div
                                        className="dashboard-chart-row__fill"
                                        style={{ width: `${largura}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}