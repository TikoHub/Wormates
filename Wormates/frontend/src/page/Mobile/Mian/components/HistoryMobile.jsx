import React, {useState, useEffect, useHistory, useCallback, useRef, useLayoutEffect,createContext, useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useNavigate, NavLink, useParams,useLocation, Switch, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import apiUrl from '../../../../apiUrl';
import { jwtDecode } from 'jwt-decode';


function MobileHistory({ onWidthToggle }) {
    const [activeTab, setActiveTab] = useState('All');
    const [books, setBooks] = useState({});
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    const username = decodedToken.username;

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('Токен не найден');
                    return;
                }
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
                const response = await axios.get(`${apiUrl}/api/history`, config);
                setBooks(response.data);
            } catch (error) {
                console.error('Ошибка при получении книг', error);
            }
        };

        fetchBooks();
    }, [username]);

    const filteredBooks = () => {
        switch (activeTab) {
            case 'Today':
                return books.Today;
            case 'Yesterday':
                return books.Yesterday;
            case 'Last Week':
                return books['Last Week'];
            case 'Month Ago':
                return books['Month Ago'];
            case 'A Year Ago':
                return books['A Year Ago'];
            case 'All':
            default:
                return Object.values(books).flat(); // Объединяем все книги
        }
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    return (
        <div className="history_log_mobile">
            <ul className="library_log_nav">
                <li onClick={() => handleTabClick('Today')}>Today</li>
                <li onClick={() => handleTabClick('Yesterday')}>Yesterday</li>
                <li onClick={() => handleTabClick('Last Week')}>Last Wee</li>
                <li onClick={() => handleTabClick('Month Ago')}>Month Ago</li>
                <li onClick={() => handleTabClick('A Year Ago')}>A Year Ago</li>
                <li onClick={() => handleTabClick('All')}>All</li>
            </ul>
            <div className='history_log_content'>
                <div className='history_items_mobile'>
                    {filteredBooks().map((book, index) => (
                        <div className='history_item_mobile' key={index}>
                            <div className='library__item_content'>
                                <a href={`book_detail/${book.id}`}>
                                    <div className='library_item-coverpage_mobile'>
                                        <img src={book.coverpage} alt={book.book_name} />
                                    </div>
                                </a>
                                <a href={`book_detail/${book.id}`}>
                                    <div className='book-name_mobile'>{book.book_name}</div>
                                </a>
                                <div className='book-author'>{book.author_name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MobileHistory;