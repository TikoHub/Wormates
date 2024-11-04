import React, {useState, useEffect, useHistory, useCallback, useRef, useLayoutEffect,createContext, useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useNavigate, NavLink, useParams,useLocation, Switch, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import apiUrl from '../../../../apiUrl';
import { jwtDecode } from 'jwt-decode';


function BookGenre(){
    const [freeBooks, setFreeBooks] = useState(false);
    const [firstBooks, setFirstBooks] = useState(false);
    const [genreData, setGenreData] = useState(null);
    const [isGenreOpen, setIsGenreOpen] = useState(false);

    const openGenre = async (genreId) => {
        try {
            const response = await axios.get(`${apiUrl}/api/?genre_id=${genreId}`);
            setGenreData(response.data);
            setIsGenreOpen(true);
        } catch (error) {
            console.error("Ошибка при загрузке данных жанра:", error);
        }
    };

    const closeGenre = () => {
        setIsGenreOpen(false);
        setGenreData(null);
    };
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
            <button className='main_genre_link' id='15'onClick={() => openGenre(15)}>Adventure</button>
            <button className='main_genre_link' id='10'>Detective</button>
            <button className='main_genre_link' id='2'>Fantasy</button>
            <button className='main_genre_link' id='55'>Horror</button>
            <button className='main_genre_link'>Romance</button>
            <button className='main_genre_link' id='8'>Sci - Fi</button>
            <div className="title-with-lines"><div class="line"></div>Full list of Genres<div class="line"></div></div>
            <div className='genre_colums'>
                <div className='genre_colum_one'>
                    <div className='main_genre' id="2">Fantasy</div>
                    <button className='subgenre' id="3">Romantic Fantasy</button>
                    <button className='subgenre' id="4">Action Fantasy</button>
                    <button className='subgenre' id="5">Urban Fantasy</button>
                    <button className='subgenre' id="6">Dark Fantasy</button>
                    <button className='subgenre' id="19">Humorous Fantasy</button>
                    <button className='subgenre' id="20">Heroic Fantasy</button>
                    <button className='subgenre' id="22">Noble Fantasy</button>
                    <button className='subgenre' id="21">Epic Fantasy</button>
                    <button className='subgenre' id="23">Historical Fantasy</button>
                    <button className='subgenre' id="24">Magic Academy</button>
                    <button className='subgenre' id="25">Wuxia</button>
                    <div className='main_genre' id="7">Romance Novels</div>
                    <button className='subgenre' id="29">Romance Novel</button>
                    <button className='subgenre' id="30">Contemporary Romance Novel</button>
                    <button className='subgenre' id="31">Short Romance Novel</button>
                    <button className='subgenre' id="43">Historical Romance Novel</button>
                    <button className='subgenre' id="44">Political Romance</button>
                    <button className='subgenre' id="10">Detective</button>
                    <button className='subgenre' id="45">Historical Detective</button>
                    <button className='subgenre' id="46">Spy Detective</button>
                    <button className='subgenre' id="47">Fantasy Detective</button>
                    <div className='main_genre' id="17">RPG</div>
                    <button className='subgenre' id="48">Literature RPG</button>
                    <button className='subgenre' id="49">Real Literature RPG</button>
                    <div className='main_genre' id="16">Supernatural</div>
                    <button className='subgenre' id="54">Thriller</button>
                    <button className='subgenre' id="55">Horror</button>
                    <button className='subgenre' id="56">Mysticism</button>
                    <div className='main_genre' id="15">Adventure</div>
                    <button className='subgenre' id="57">Adventure</button>
                    <button className='subgenre' id="58">Historical Adventure</button>
                </div>
                    <div className='genre_colum_two'>
                        <div className='main_genre' id="9">Travelers (Isekai)</div>
                        <button className='subgenre' id="26">Time Travelers</button>
                        <button className='subgenre' id="28">Travelers to Magical Worlds</button>
                        <button className='subgenre' id="27">Space Travelers</button>
                        <button className='subgenre' id="8">Science Fiction</button>
                        <button className='subgenre' id="32">Action Science Fiction</button>
                        <button className='subgenre' id="33">Alternate History</button>
                        <button className='subgenre' id="34">Space Opera</button>
                        <button className='subgenre' id="35">Social Science Fiction</button>
                        <button className='subgenre' id="36">Post-Apocalyptic</button>
                        <button className='subgenre' id="37">Hard Science Fiction</button>
                        <button className='subgenre' id="38">Humorous Science Fiction</button>
                        <button className='subgenre' id="39">Dystopian</button>
                        <button className='subgenre' id="40">Cyberpunk</button>
                        <button className='subgenre' id="41">Heroic Science Fiction</button>
                        <button className='subgenre' id="42">Steampunk</button>
                        <div className='main_genre' id="11">Prose</div>
                        <button className='subgenre' id="50">Contemporary Prose</button>
                        <button className='subgenre' id="51">Historical Prose</button>
                        <button className='subgenre' id="52">Young Adult Prose</button>
                        <button className='subgenre' id="53">Documentary Prose</button>
                        <div className='main_genre' id="12">Erotic</div>
                        <button className='subgenre' id="63">Romantic Erotica</button>
                        <button className='subgenre' id="64">Erotic Fantasy</button>
                        <button className='subgenre' id="65">Erotic Science Fiction</button>
                        <button className='subgenre' id="66">Erotic Fanfiction</button>
                        <div className='main_genre' id="13">FanFiction</div>
                        <button className='subgenre' id="61">FanFiction</button>
                        <div className='main_genre' id="14">Action</div>
                        <button className='subgenre' id="59">Action</button>
                        <button className='subgenre' id="60">Historical Action</button>
                    </div>
            </div>
            <div className='main_genre'>Miscellaneous</div>
            <div className='genre_colums'>
                <div className='genre_colum_two'>
                    <button className='subgenre' id="67">Fairy Tale</button>
                    <button className='subgenre' id="68">Children's Literature</button>
                    <button className='subgenre' id="69">Humor</button>
                    <button className='subgenre' id="70">Poetry</button>
                </div>
                <div className='genre_colum_two'>
                    <button className='subgenre' id="71">Personal Development</button>
                    <button className='subgenre' id="72">Journalism</button>
                    <button className='subgenre' id="73">Business Literature</button>
                    <button className='subgenre' id="74">Poetry Collection</button>
                </div>
            </div>
            {isGenreOpen && (
                <div className="modal-overlay" onClick={closeGenre}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={closeGenre}>×</button>
                        {genreData ? (
                            <div>
                                <h2>{genreData.name}</h2>
                                <p>{genreData.description}</p>
                            </div>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default BookGenre;