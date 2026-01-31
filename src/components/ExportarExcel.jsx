import { Download, FileSpreadsheet } from 'lucide-react';
import { useMemo, useState } from 'react';
import './ExportarExcel.css';

const ExportarExcel = ({ onExportar, exporting }) => {
    const [exportForm, setExportForm] = useState({
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear()
    });

    const meses = useMemo(() => [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ], []);

    const anos = useMemo(() =>
        Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i),
        []);

    return (
        <section className="exportar-excel">
            <div className="exportar-header">
                <div className="exportar-icon">
                    <FileSpreadsheet className="icon-lg" />
                </div>
                <h2 className="exportar-title">Exportar Planilha</h2>
            </div>
            <p className="exportar-subtitle">Gere uma planilha Excel com todos os apontamentos do mês</p>

            <div className="exportar-form">
                <div className="form-group">
                    <label className="form-label">Mês</label>
                    <select
                        value={exportForm.mes}
                        onChange={(e) => setExportForm({ ...exportForm, mes: parseInt(e.target.value) })}
                        disabled={exporting}
                        className="select"
                    >
                        {meses.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Ano</label>
                    <select
                        value={exportForm.ano}
                        onChange={(e) => setExportForm({ ...exportForm, ano: parseInt(e.target.value) })}
                        disabled={exporting}
                        className="select"
                    >
                        {anos.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={() => onExportar(exportForm.mes, exportForm.ano)}
                    disabled={exporting}
                    className="btn btn-export"
                >
                    {exporting ? (
                        <>
                            <div className="spinner"></div>
                            Exportando...
                        </>
                    ) : (
                        <>
                            <Download className="icon-md" />
                            Exportar Excel
                        </>
                    )}
                </button>
            </div>
        </section>
    );
};

export default ExportarExcel;