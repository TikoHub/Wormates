import React, {useState, useEffect, useHistory, useCallback, useRef, useLayoutEffect,createContext, useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useNavigate, NavLink, useParams,useLocation, Switch, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import apiUrl from '../../../../apiUrl';
import { jwtDecode } from 'jwt-decode';


function BookGenre(){
    const [freeBooks, setFreeBooks] = useState(false);
    const [firstBooks, setFirstBooks] = useState(false);
    const [genreData, setGenreData] = useState([]);
    const [isGenreOpen, setIsGenreOpen] = useState(false);
    const [sortCriteria, setSortCriteria] = useState('views_count');
    const [currentGenreId, setCurrentGenreId] = useState(null);
    const [currentDateFilter, setCurrentDateFilter] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');

    const openGenre = async (genreId, dateFilter) => {
        try {
            const response = await axios.get(`${apiUrl}/api/?genre_id=${genreId}&date_filter=${dateFilter}`);
            
            if (response.status === 200 && response.data.length > 0) {
                setGenreData(response.data); // Установите данные жанра
                setIsGenreOpen(true);        // Откройте модальное окно или блок с данными
            } else {
                console.error("Ошибка: данные жанра не найдены.");
            }
        } catch (error) {
            console.error("Ошибка при загрузке данных жанра:", error);
        }
    };
    const genreButton = (genreId, genreName) => {
        setCurrentGenreId(genreId);
        setSelectedGenre(genreName);
        openGenre(genreId, currentDateFilter);
    };

    // Установка фильтра по дате и открытие с текущим жанром
    const genreFilterButton = (dateFilter) => {
        setCurrentDateFilter(prevDateFilter => {
            // В данном случае обновляется текущий фильтр, и только после этого вызывается openGenre
            if (currentGenreId) {
                openGenre(currentGenreId, dateFilter);
            }
            return dateFilter;
        });
    };
    useEffect(() => {
        if (currentGenreId) {
          openGenre(currentGenreId, currentDateFilter); // Загрузка данных при первом рендере
        }
      }, [currentGenreId, currentDateFilter]);

    const closeGenre = () => {
        setIsGenreOpen(false);
        setGenreData([]);
    };
    

    const sortedData = [...genreData].sort((a, b) => {
        if (sortCriteria === 'views_count') {
            return b.views_count - a.views_count; // Чем больше views_count, тем выше
        } else if (sortCriteria === 'last_modified') {
            return new Date(b.last_modified) - new Date(a.last_modified); // Чем новее, тем выше
        } else if (sortCriteria === 'upvotes') {
            return b.upvotes - a.upvotes; // Чем больше upvotes, тем выше
        }
        return 0;
    });
    
    return(
        <div className='book_genre_page'>
            <div className='genre_settings'>
                <div className='genre_setting'>
                    <div className='genre_set_view'>Show only free boks</div>
                    <button className={freeBooks ? 'genre-button enabled' : 'genre-button disabled'} ></button>
                </div>
                <div className='genre_setting'>
                    <div className='genre_set_view'>Show only first book in series</div>
                    <button className={firstBooks ? 'genre-button enabled' : 'genre-button disabled'} ></button>
                </div>
            </div>
            <button className='main_genre_link' id='15' onClick={() => genreButton(15, 'Adventure')}>Adventure</button>
            <button className='main_genre_link' id='10' onClick={() => genreButton(10, 'Detective')}>Detective</button>
            <button className='main_genre_link' id='2' onClick={() => genreButton(2, 'Fantasy')}>Fantasy</button>
            <button className='main_genre_link' id='55' onClick={() => genreButton(55, 'Horror')}>Horror</button>
            <button className='main_genre_link' id='romance' onClick={() => genreButton('romance', 'Romance')}>Romance</button>
            <button className='main_genre_link' id='8' onClick={() => genreButton(8, 'Sci - Fi')}>Sci - Fi</button>

            <div className="title-with-lines"><div class="line"></div>Full list of Genres<div class="line"></div></div>
            <div className='genre_colums'>
            <div className='genre_colum_one'>
                <div className='main_genre' id="2">Fantasy</div>
                <button className='subgenre' id="3" onClick={() => genreButton(3,'Romantic Fantasy')}>Romantic Fantasy</button>
                <button className='subgenre' id="4" onClick={() => genreButton(4,'Action Fantasy')}>Action Fantasy</button>
                <button className='subgenre' id="5" onClick={() => genreButton(5,'Urban Fantasy')}>Urban Fantasy</button>
                <button className='subgenre' id="6" onClick={() => genreButton(6,'Dark Fantasy')}>Dark Fantasy</button>
                <button className='subgenre' id="19" onClick={() => genreButton(19,'Humorous Fantasy')}>Humorous Fantasy</button>
                <button className='subgenre' id="20" onClick={() => genreButton(20,'Heroic Fantasy')}>Heroic Fantasy</button>
                <button className='subgenre' id="22" onClick={() => genreButton(22,'Noble Fantasy')}>Noble Fantasy</button>
                <button className='subgenre' id="21" onClick={() => genreButton(21,'Epic Fantasy')}>Epic Fantasy</button>
                <button className='subgenre' id="23" onClick={() => genreButton(23,'Historical Fantasy')}>Historical Fantasy</button>
                <button className='subgenre' id="24" onClick={() => genreButton(24,'Magic Academy')}>Magic Academy</button>
                <button className='subgenre' id="25" onClick={() => genreButton(25,'Wuxia')}>Wuxia</button>

                <div className='main_genre' id="7">Romance Novels</div>
                <button className='subgenre' id="29" onClick={() => genreButton(29,'Romance Novel')}>Romance Novel</button>
                <button className='subgenre' id="30" onClick={() => genreButton(30,'Contemporary Romance Novel')}>Contemporary Romance Novel</button>
                <button className='subgenre' id="31" onClick={() => genreButton(31,'Short Romance Novel')}>Short Romance Novel</button>
                <button className='subgenre' id="43" onClick={() => genreButton(43,'Historical Romance Novel')}>Historical Romance Novel</button>
                <button className='subgenre' id="44" onClick={() => genreButton(44,'Political Romance')}>Political Romance</button>

                <button className='subgenre' id="10" onClick={() => genreButton(10,'Detective')}>Detective</button>
                <button className='subgenre' id="45" onClick={() => genreButton(45,'Historical Detective')}>Historical Detective</button>
                <button className='subgenre' id="46" onClick={() => genreButton(46,'Spy Detective')}>Spy Detective</button>
                <button className='subgenre' id="47" onClick={() => genreButton(47,'Fantasy Detective')}>Fantasy Detective</button>

                <div className='main_genre' id="17" onClick={() => genreButton(17,'RPG')}>RPG</div>
                <button className='subgenre' id="48" onClick={() => genreButton(48,'Literature RPG')}>Literature RPG</button>
                <button className='subgenre' id="49" onClick={() => genreButton(49,'Real Literature RPG')}>Real Literature RPG</button>

                <div className='main_genre' id="16">Supernatural</div>
                <button className='subgenre' id="54" onClick={() => genreButton(54,'Thriller')}>Thriller</button>
                <button className='subgenre' id="55" onClick={() => genreButton(55,'Horror')}>Horror</button>
                <button className='subgenre' id="56" onClick={() => genreButton(56,'Mysticism')}>Mysticism</button>

                <div className='main_genre' id="15">Adventure</div>
                <button className='subgenre' id="57" onClick={() => genreButton(57,'Adventure')}>Adventure</button>
                <button className='subgenre' id="58" onClick={() => genreButton(58,'Historical Adventure')}>Historical Adventure</button>
            </div>
            <div className='genre_colum_two'>
                <div className='main_genre' id="9">Travelers (Isekai)</div>
                <button className='subgenre' id="26" onClick={() => genreButton(26, 'Time Travelers')}>Time Travelers</button>
                <button className='subgenre' id="28" onClick={() => genreButton(28, 'Travelers to Magical Worlds')}>Travelers to Magical Worlds</button>
                <button className='subgenre' id="27" onClick={() => genreButton(27, 'Space Travelers')}>Space Travelers</button>
                <div className='main_genre' id="8">Science Fiction</div>
                <button className='subgenre' id="8" onClick={() => genreButton(8, 'Science Fiction')}>Science Fiction</button>
                <button className='subgenre' id="32" onClick={() => genreButton(32, 'Action Science Fiction')}>Action Science Fiction</button>
                <button className='subgenre' id="33" onClick={() => genreButton(33, 'Alternate History')}>Alternate History</button>
                <button className='subgenre' id="34" onClick={() => genreButton(34, 'Space Opera')}>Space Opera</button>
                <button className='subgenre' id="35" onClick={() => genreButton(35, 'Social Science Fiction')}>Social Science Fiction</button>
                <button className='subgenre' id="36" onClick={() => genreButton(36, 'Post-Apocalyptic')}>Post-Apocalyptic</button>
                <button className='subgenre' id="37" onClick={() => genreButton(37, 'Hard Science Fiction')}>Hard Science Fiction</button>
                <button className='subgenre' id="38" onClick={() => genreButton(38, 'Humorous Science Fiction')}>Humorous Science Fiction</button>
                <button className='subgenre' id="39" onClick={() => genreButton(39, 'Dystopian')}>Dystopian</button>
                <button className='subgenre' id="40" onClick={() => genreButton(40, 'Cyberpunk')}>Cyberpunk</button>
                <button className='subgenre' id="41" onClick={() => genreButton(41, 'Heroic Science Fiction')}>Heroic Science Fiction</button>
                <button className='subgenre' id="42" onClick={() => genreButton(42, 'Steampunk')}>Steampunk</button>

                <div className='main_genre' id="11" onClick={() => genreButton(11, 'Prose')}>Prose</div>
                <button className='subgenre' id="50" onClick={() => genreButton(50, 'Contemporary Prose')}>Contemporary Prose</button>
                <button className='subgenre' id="51" onClick={() => genreButton(51, 'Historical Prose')}>Historical Prose</button>
                <button className='subgenre' id="52" onClick={() => genreButton(52, 'Young Adult Prose')}>Young Adult Prose</button>
                <button className='subgenre' id="53" onClick={() => genreButton(53, 'Documentary Prose')}>Documentary Prose</button>

                <div className='main_genre' id="12" onClick={() => genreButton(12, 'Erotic')}>Erotic</div>
                <button className='subgenre' id="63" onClick={() => genreButton(63, 'Romantic Erotica')}>Romantic Erotica</button>
                <button className='subgenre' id="64" onClick={() => genreButton(64, 'Erotic Fantasy')}>Erotic Fantasy</button>
                <button className='subgenre' id="65" onClick={() => genreButton(65, 'Erotic Science Fiction')}>Erotic Science Fiction</button>
                <button className='subgenre' id="66" onClick={() => genreButton(66, 'Erotic Fanfiction')}>Erotic Fanfiction</button>

                <div className='main_genre' id="13" onClick={() => genreButton(13, 'FanFiction')}>FanFiction</div>
                <button className='subgenre' id="61" onClick={() => genreButton(61, 'FanFiction')}>FanFiction</button>

                <div className='main_genre' id="14" onClick={() => genreButton(14, 'Action')}>Action</div>
                <button className='subgenre' id="59" onClick={() => genreButton(59, 'Action')}>Action</button>
                <button className='subgenre' id="60" onClick={() => genreButton(60, 'Historical Action')}>Historical Action</button>
            </div>

            </div>
            <div className='main_genre'>Miscellaneous</div>
            <div className='genre_colums'>
                <div className='genre_colum_two'>
                    <button className='subgenre' id="67" onClick={() => genreButton(67, 'Fairy Tale')}>Fairy Tale</button>
                    <button className='subgenre' id="68" onClick={() => genreButton(68, 'Children\'s Literature')}>Children's Literature</button>
                    <button className='subgenre' id="69" onClick={() => genreButton(69, 'Humor')}>Humor</button>
                    <button className='subgenre' id="70" onClick={() => genreButton(70, 'Poetry')}>Poetry</button>
                </div>
                <div className='genre_colum_two'>
                    <button className='subgenre' id="71" onClick={() => genreButton(71, 'Personal Development')}>Personal Development</button>
                    <button className='subgenre' id="72" onClick={() => genreButton(72, 'Journalism')}>Journalism</button>
                    <button className='subgenre' id="73" onClick={() => genreButton(73, 'Business Literature')}>Business Literature</button>
                    <button className='subgenre' id="74" onClick={() => genreButton(74, 'Poetry Collection')}>Poetry Collection</button>
                </div>
            </div>

            {isGenreOpen && (
                <div className="genre_detail_page">
                    <div className="genre_detail_content" onClick={(e) => e.stopPropagation()}>
                        <div className='genre_detail_header'>
                            <button onClick={closeGenre} className='genre_detail_header_button'><div class="adult_arrow_container">    <svg width="50" height="20">
        <polygon points="20,0 0,10 20,20" class="adult_arrow" />
    </svg></div></button>
                            <div className='genre_detail_header_button' onClick={() => setSortCriteria('views_count')}><svg width="40px" fill="#fff" height="40px" viewBox="0 0 12 12" enable-background="new 0 0 12 12" id="Слой_1" version="1.1" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">

<g>

<circle cx="6" cy="6"  r="1.5"/>

<path d="M6,2C4,2,2,3,0,6c2,3,4,4,6,4s4-1,6-4C10,3,8,2,6,2z M6,8.5C4.621582,8.5,3.5,7.3789063,3.5,6   S4.621582,3.5,6,3.5S8.5,4.6210938,8.5,6S7.378418,8.5,6,8.5z" />

</g>

</svg>Views</div>
                            <div className='genre_detail_header_button' onClick={() => setSortCriteria('last_modified')}><svg width="40px" height="40px" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.0284 1.11813C9.69728 1.2952 9.53443 1.61638 9.49957 1.97965C9.48456 2.15538 9.46201 2.32986 9.43136 2.50363C9.3663 2.87248 9.24303 3.3937 9.01205 3.98313C8.5513 5.15891 7.67023 6.58926 5.96985 7.65195C3.57358 9.14956 2.68473 12.5146 3.06456 15.527C3.45234 18.6026 5.20871 21.7903 8.68375 22.9486C9.03 23.0641 9.41163 22.9817 9.67942 22.7337C10.0071 22.4303 10.0238 22.0282 9.94052 21.6223C9.87941 21.3244 9.74999 20.5785 9.74999 19.6875C9.74999 19.3992 9.76332 19.1034 9.79413 18.8068C10.3282 20.031 11.0522 20.9238 11.7758 21.5623C12.8522 22.5121 13.8694 22.8574 14.1722 22.9466C14.402 23.0143 14.6462 23.0185 14.8712 22.9284C17.5283 21.8656 19.2011 20.4232 20.1356 18.7742C21.068 17.1288 21.1993 15.3939 20.9907 13.8648C20.7833 12.3436 20.2354 10.9849 19.7537 10.0215C19.3894 9.29292 19.0534 8.77091 18.8992 8.54242C18.7101 8.26241 18.4637 8.04626 18.1128 8.00636C17.8332 7.97456 17.5531 8.06207 17.3413 8.24739L15.7763 9.61686C15.9107 7.44482 15.1466 5.61996 14.1982 4.24472C13.5095 3.24609 12.7237 2.47913 12.1151 1.96354C11.8094 1.70448 11.5443 1.50549 11.3525 1.36923C11.2564 1.30103 11.1784 1.24831 11.1224 1.21142C10.7908 0.99291 10.3931 0.923125 10.0284 1.11813ZM7.76396 20.256C7.75511 20.0744 7.74999 19.8842 7.74999 19.6875C7.75 18.6347 7.89677 17.3059 8.47802 16.0708C8.67271 15.6572 8.91614 15.254 9.21914 14.8753C9.47408 14.5566 9.89709 14.4248 10.2879 14.5423C10.6787 14.6598 10.959 15.003 10.9959 15.4094C11.2221 17.8977 12.2225 19.2892 13.099 20.0626C13.5469 20.4579 13.979 20.7056 14.292 20.8525C15.5 20.9999 17.8849 18.6892 18.3955 17.7882C19.0569 16.6211 19.1756 15.356 19.0091 14.1351C18.8146 12.7092 18.2304 11.3897 17.7656 10.5337L14.6585 13.2525C14.3033 13.5634 13.779 13.5835 13.401 13.3008C13.023 13.018 12.8942 12.5095 13.092 12.0809C14.4081 9.22933 13.655 6.97987 12.5518 5.38019C12.1138 4.74521 11.6209 4.21649 11.18 3.80695C11.0999 4.088 10.9997 4.39262 10.8742 4.71284C10.696 5.16755 10.4662 5.65531 10.1704 6.15187C9.50801 7.26379 8.51483 8.41987 7.02982 9.34797C5.57752 10.2556 4.71646 12.6406 5.04885 15.2768C5.29944 17.2643 6.20241 19.1244 7.76396 20.256Z" fill="#fff"/>
</svg>New</div>
                            <div className='genre_detail_header_button' onClick={() => setSortCriteria('upvotes')}><svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z" fill="#ffffff"/>
</svg>Popular</div>
                        </div>
                        <div className='genre_detail_views'>{selectedGenre}</div>
                        <ul className="genre_detail_log_nav">
                            <li onClick={() => genreFilterButton('today')}>Today</li>
                            <li onClick={() => genreFilterButton('yesterday')}>Yesterday</li>
                            <li onClick={() => genreFilterButton('last_week')}>Last Wee</li>
                            <li onClick={() => genreFilterButton('month_ago')}>Month Ago</li>
                            <li onClick={() => genreFilterButton('year_ago')}>Year Ago</li>
                        </ul>
                        <div className='genre_detail_items'>
                        {sortedData.map((book) => (
                            <div className='library_item_mobile' key={book.id}>
                                <div className='library__item_content'>
                                    <a href={`book_detail/${book.id}`}>
                                        <div className='library_item-coverpage_mobile'>
                                            <img src={book.coverpage} alt={book.name} />
                                        </div>
                                    </a>
                                    <a href={`book_detail/${book.id}`}>
                                        <div className='book-name_mobile'>{book.name}</div>
                                    </a>
                                    <div className='book-author'>{book.author}</div>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BookGenre;