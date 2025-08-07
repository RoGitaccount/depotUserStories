import { Listbox } from '@headlessui/react';
import { Fragment } from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import countries from 'i18n-iso-countries';
import fr from 'i18n-iso-countries/langs/fr.json';
import { useField, useFormikContext } from 'formik';

countries.registerLocale(fr);
const countryList = countries.getNames('fr', { select: 'official' });
const countryOptions = Object.entries(countryList).map(([code, name]) => name).sort();

const CountryListbox = ({ name }) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  return (
    <div className="w-full">
      <Listbox value={field.value} onChange={(value) => setFieldValue(name, value)}>
        {({ open }) => (
          <div className="relative">
            <Listbox.Button className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 text-left">
              <span className="block truncate">{field.value || "Sélectionner un pays"}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </span>
            </Listbox.Button>

            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 text-black dark:text-white shadow-lg ring-1 ring-black/10 focus:outline-none sm:text-sm">
              {countryOptions.map((country) => (
                <Listbox.Option
                  key={country}
                  value={country}
                  className={({ active }) =>
                    `cursor-pointer select-none relative px-4 py-2 ${
                      active ? 'bg-blue-100 dark:bg-gray-700' : ''
                    }`
                  }
                >
                  {({ selected }) => (
                    <Fragment>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {country}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 right-4 flex items-center text-blue-600">
                          <CheckIcon className="w-4 h-4" />
                        </span>
                      )}
                    </Fragment>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        )}
      </Listbox>

      {meta.touched && meta.error && (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      )}
    </div>
  );
};

export default CountryListbox;
