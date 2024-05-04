import './App.scss';

import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';

import classNames from 'classnames';
import { debounce } from 'lodash';
import { peopleFromServer } from './data/people';
import { Person } from './types/Person';

const DELAY_DEBOUNCE = 300;

const filteredPeople = (people: Person[], query: string) => {
  const normalizeQuery = query.trim().toLowerCase();

  return people.filter(person =>
    person.name.toLowerCase().includes(normalizeQuery),
  );
};

export const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<Person | null>(null);

  const visiblePeople = useMemo(
    () => filteredPeople(peopleFromServer, appliedQuery),
    [appliedQuery],
  );

  const onSelected = (person: Person) => {
    setSelectedPeople(person);
    setQuery(person.name);
  };

  const applyQuery = useCallback(
    debounce((value: string) => {
      setAppliedQuery(value);
      setShowDropdown(true);
    }, DELAY_DEBOUNCE),
    [],
  );

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setQuery(value);
    applyQuery(value);
    setShowDropdown(false);
    setSelectedPeople(null);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 300);
  };

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        {selectedPeople ? (
          <h1 className="title" data-cy="title">
            {`${selectedPeople.name} (${selectedPeople.born} - ${selectedPeople.died})`}
          </h1>
        ) : (
          <h1 className="title" data-cy="title">
            No selected person
          </h1>
        )}

        <div
          className={classNames('dropdown', {
            'is-active': showDropdown,
          })}
        >
          <div className="dropdown-trigger">
            <input
              value={query}
              onChange={handleQueryChange}
              type="text"
              placeholder="Enter a part of the name"
              className="input"
              data-cy="search-input"
              onFocus={() => setShowDropdown(true)}
              onBlur={handleInputBlur}
            />
          </div>

          {visiblePeople.length !== 0 && (
            <div
              className="dropdown-menu"
              role="menu"
              data-cy="suggestions-list"
            >
              <div className="dropdown-content">
                {visiblePeople.map(person => (
                  <div
                    key={person.slug}
                    className="dropdown-item"
                    data-cy="suggestion-item"
                    onClick={() => onSelected(person)}
                  >
                    <p
                      className={classNames('', {
                        'has-text-link': person.sex === 'm',
                        'has-text-danger': person.sex === 'f',
                      })}
                    >
                      {person.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {visiblePeople.length === 0 && query && (
          <div
            className="
            notification
            is-danger
            is-light
            mt-3
            is-align-self-flex-start
          "
            role="alert"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
