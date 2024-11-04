import React, {useState, useEffect, useHistory, useCallback, useRef, useLayoutEffect,createContext, useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useNavigate, NavLink, useParams,useLocation, Switch, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import apiUrl from '../../../../apiUrl';
import { jwtDecode } from 'jwt-decode';

function GenreList(){
    return(
        <div>
            <div>
                <div></div>
                <div>Views</div>
                <div>New</div>
                <div>Popular</div>
            </div>
            <div>
                <div>
                    <div></div>
                    <div>
                        <div>Tpday</div>
                        <div>Last Day</div>
                        <div>Well Ago</div>
                        <div>Mounth Ago</div>
                        <div>Year Ago</div>
                    </div>
                </div>
                <div></div>
            </div>
            <div></div>
        </div>
    )
}