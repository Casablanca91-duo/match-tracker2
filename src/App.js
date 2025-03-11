import React, { useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import "./App.css";

function App() {
    const [matches, setMatches] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // 'all', 'live', 'finished'
    const [expandedMatchId, setExpandedMatchId] = useState(null);

    // Анимация изменения чисел
    function AnimatedNumber({ value }) {
        const { number } = useSpring({
            from: { number: 0 },
            to: { number: value },
            config: { duration: 500 },
        });

        return <animated.span>{number.to((n) => Math.floor(n))}</animated.span>;
    }

    // Управление видимостью деталей матча
    const toggleDetails = (id) => {
        setExpandedMatchId(expandedMatchId === id ? null : id);
    };

    // Фильтрация матчей
    const filteredMatches = matches.filter((match) => {
        if (filter === "live") return match.status === "Ongoing";
        if (filter === "finished") return match.status === "Finished";
        return true;
    });

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await fetch("https://app.ftoyd.com/fronttemp-service/fronttemp");
                if (!response.ok) {
                    throw new Error("Ошибка: не удалось загрузить информацию");
                }
                const data = await response.json();
                setMatches(data.data.matches); // Сохраняем список матчей
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);  
            }
        };

        fetchMatches();

        // Обновляем данные каждые 5 секунд
        const intervalId = setInterval(fetchMatches, 3000);

        return () => clearInterval(intervalId);
    }, []);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="app">
            <h1>Match Tracker</h1>

            {/* Фильтр */}
            <div className="filters">
                <button onClick={() => setFilter("all")}>Все матчи</button>
                <button onClick={() => setFilter("live")}>Live</button>
                <button onClick={() => setFilter("finished")}>Завершенные</button>
            </div>

            {/* Список матчей */}
            <ul className="match-list">
                {filteredMatches.map((match) => (
                    <li key={match.title} className="match-item">
                        <div className="match-header">
                            <strong>{match.awayTeam.name}</strong>
                            <div className="match-header-score">
                                <p>
                                    <AnimatedNumber value={match.homeScore} /> :{" "}
                                    <AnimatedNumber value={match.awayScore} />
                                </p>
                                <p>{match.status}</p>
                                <button onClick={() => toggleDetails(match.title)}>
                                    {expandedMatchId === match.title ? "Скрыть детали" : "Показать детали"}
                                </button>
                            </div>
                            <strong>{match.homeTeam.name}</strong>
                        </div>

                        {/* Детали матча */}
                        {expandedMatchId === match.title && (
                            <ul className="match-details">
                                <li>Время: {new Date(match.time).toLocaleString()}</li>
                                <li>Место домашней команды: {match.homeTeam.place}</li>
                                <li>Место гостевой команды: {match.awayTeam.place}</li>
                                <li>Игроки домашней команды:</li>
                                <ul>
                                    {match.homeTeam.players.map((player) => (
                                        <li key={player.username}>
                                            {player.username} - Убийств: {player.kills}
                                        </li>
                                    ))}
                                </ul>
                                <li>Игроки гостевой команды:</li>
                                <ul>
                                    {match.awayTeam.players.map((player) => (
                                        <li key={player.username}>
                                            {player.username} - Убийств: {player.kills}
                                        </li>
                                    ))}
                                </ul>
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;