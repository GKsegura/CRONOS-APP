import { Copy, MessageCircle, Minus, Send, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import './ChatIA.css';

const mensagemInicial = {
    role: 'assistant',
    text: 'Olá! Sou o Assistente CRONOS. Posso te ajudar a reformular mensagens, melhorar descrições, resumir textos e organizar ideias.',
};

const ChatIA = () => {
    const [aberto, setAberto] = useState(false);
    const [minimizado, setMinimizado] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensagens, setMensagens] = useState([mensagemInicial]);

    const mensagensRef = useRef(null);

    useEffect(() => {
        if (mensagensRef.current) {
            mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
        }
    }, [mensagens, loading, aberto, minimizado]);

    const enviarMensagem = async () => {
        const texto = mensagem.trim();
        if (!texto || loading) return;

        setMensagens((prev) => [...prev, { role: 'user', text: texto }]);
        setMensagem('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/ia/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mensagem: texto,
                    modelo: 'gemini-2.5-flash',
                }),
            });

            if (!response.ok) {
                throw new Error('Falha ao conversar com a IA.');
            }

            const data = await response.json();

            setMensagens((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: data.texto || 'Não consegui gerar uma resposta agora.',
                },
            ]);
        } catch (err) {
            setMensagens((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: 'Não consegui responder agora. Verifique se o backend está rodando e se a chave da IA está configurada.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const copiarTexto = async (texto) => {
        try {
            await navigator.clipboard.writeText(texto);
            toast.success('Resposta copiada!');
        } catch (err) {
            toast.error('Não foi possível copiar o texto.');
        }
    };

    const limparChat = () => {
        setMensagens([mensagemInicial]);
        setMensagem('');
    };

    const aplicarSugestao = (texto) => {
        setMensagem(texto);
    };

    const abrirChat = () => {
        setAberto(true);
        setMinimizado(false);
    };

    const fecharChat = () => {
        setAberto(false);
        setMinimizado(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensagem();
        }
    };

    return (
        <div className="chat-ia-root">
            {!aberto && (
                <button
                    type="button"
                    className="chat-ia-floating"
                    onClick={abrirChat}
                    title="Abrir Assistente CRONOS"
                >
                    <Sparkles size={20} />
                    <span>IA</span>
                </button>
            )}

            {aberto && (
                <section className={`chat-ia-widget ${minimizado ? 'minimized' : 'open'}`}>
                    <header className="chat-ia-header">
                        <div className="chat-ia-title">
                            <div className="chat-ia-avatar">
                                <Sparkles size={18} />
                            </div>

                            <div>
                                <h3>
                                    <MessageCircle size={17} />
                                    Assistente CRONOS
                                </h3>
                                <p>Mensagens, descrições e ideias.</p>
                            </div>
                        </div>

                        <div className="chat-ia-window-actions">
                            <button
                                type="button"
                                onClick={() => setMinimizado((prev) => !prev)}
                                title={minimizado ? 'Expandir' : 'Minimizar'}
                            >
                                <Minus size={17} />
                            </button>

                            <button
                                type="button"
                                onClick={fecharChat}
                                title="Fechar"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    </header>

                    {!minimizado && (
                        <>
                            <div className="chat-ia-sugestoes">
                                <button
                                    type="button"
                                    onClick={() => aplicarSugestao('Reformule essa mensagem de forma mais profissional: ')}
                                >
                                    Formal
                                </button>

                                <button
                                    type="button"
                                    onClick={() => aplicarSugestao('Corrija a gramática e a concordância deste texto: ')}
                                >
                                    Corrigir
                                </button>

                                <button
                                    type="button"
                                    onClick={() => aplicarSugestao('Resuma este texto de forma objetiva: ')}
                                >
                                    Resumir
                                </button>

                                <button
                                    type="button"
                                    onClick={() => aplicarSugestao('Transforme esse texto em uma observação curta para chamado: ')}
                                >
                                    Chamado
                                </button>
                            </div>

                            <div className="chat-ia-messages" ref={mensagensRef}>
                                {mensagens.map((item, index) => (
                                    <div
                                        key={`${item.role}-${index}`}
                                        className={`chat-ia-message-wrapper ${item.role}`}
                                    >
                                        <div className={`chat-ia-message ${item.role}`}>
                                            {item.text}
                                        </div>

                                        {item.role === 'assistant' && index > 0 && (
                                            <button
                                                type="button"
                                                className="chat-ia-copy"
                                                onClick={() => copiarTexto(item.text)}
                                                title="Copiar resposta"
                                            >
                                                <Copy size={13} />
                                                Copiar
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {loading && (
                                    <div className="chat-ia-message-wrapper assistant">
                                        <div className="chat-ia-message assistant thinking">
                                            Pensando...
                                        </div>
                                    </div>
                                )}
                            </div>

                            <footer className="chat-ia-footer">
                                <textarea
                                    value={mensagem}
                                    onChange={(e) => setMensagem(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ex: reformule essa mensagem para o cliente..."
                                    rows={3}
                                    disabled={loading}
                                />

                                <div className="chat-ia-footer-actions">
                                    <button
                                        type="button"
                                        onClick={limparChat}
                                        className="chat-ia-clear"
                                        disabled={loading}
                                    >
                                        Limpar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={enviarMensagem}
                                        className="chat-ia-send"
                                        disabled={loading || !mensagem.trim()}
                                        title="Enviar"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </footer>
                        </>
                    )}
                </section>
            )}
        </div>
    );
};

export default ChatIA;