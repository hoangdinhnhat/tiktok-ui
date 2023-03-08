import { useEffect, useState, useRef } from 'react';
import { faCircleXmark, faMagnifyingGlass, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import HeadlessTippy from '@tippyjs/react/headless';
import classNames from 'classnames/bind';
import { Wrapper as PopperWrapper } from '~/components/Popper';
import AccountItem from '~/components/AccountItem';
import { useDebounce } from '~/hooks';
import styles from './Search.module.scss';
import * as searchServices from '~/services/searchService';

const cx = classNames.bind(styles);

function Search() {
    const [showResult, setShowResult] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const debounced = useDebounce(searchValue, 500);

    const inputRef = useRef();

    useEffect(() => {
        if (!debounced) {
            setSearchResult([]);
            return;
        }

        setLoading(true);
        const fetchApi = async () => {
            setLoading(true);
            const result = await searchServices.search(debounced);
            setSearchResult(result);
            setLoading(false);
        };

        fetchApi();
    }, [debounced]);

    const handleHideResult = () => {
        setShowResult(false);
    };

    return (
        // Using a wrapper <div> tag around the reference element 
        //solves this by creating a new parentNode context.
        <div>
            <HeadlessTippy
                interactive
                visible={showResult && searchResult.length > 0}
                render={(attrs) => (
                    <div className={cx('search-result')} tabIndex="-1" {...attrs}>
                        <PopperWrapper>
                            <h4 className={cx('search-title')}>Accounts</h4>
                            {searchResult.map((account) => (
                                <AccountItem key={account.id} data={account} />
                            ))}
                        </PopperWrapper>
                    </div>
                )}
                onClickOutside={handleHideResult}
            >
                <div className={cx('search')}>
                    <input
                        ref={inputRef}
                        value={searchValue}
                        placeholder="Search accounts and videos"
                        spellCheck={false}
                        onChange={(e) => {
                            let inputValue = e.target.value;
                            if (!inputValue.startsWith(' ')) {
                                setSearchValue(inputValue);
                            }
                        }}
                        onFocus={() => setShowResult(true)}
                    />
                    <div className={cx('clear-loading')}>
                        {!!searchValue && !loading && (
                            <FontAwesomeIcon
                                className={cx('icon-inputting')}
                                icon={faCircleXmark}
                                onClick={() => {
                                    setSearchValue('');
                                    setSearchResult([]);
                                    inputRef.current.focus();
                                }}
                            />
                        )}
                        {loading && <FontAwesomeIcon className={cx('icon-inputting', 'loading')} icon={faSpinner} />}
                    </div>
                    <button className={cx('search-btn')} onMouseDown={(e) => e.preventDefault()}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                </div>
            </HeadlessTippy>
        </div>
    );
}

export default Search;
