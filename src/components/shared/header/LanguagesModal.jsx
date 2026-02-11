import React from 'react'
import Link from 'next/link'
import { headerDropdownLanguagesList } from '@/utils/fackData/headerDropwodnLanguagesList'
import { FiPlus } from 'react-icons/fi'

const LanguagesModal = () => {
  return (
    <div className="dropdown nxl-h-item nxl-header-language d-none d-sm-flex">
      <div className="nxl-head-link me-0 nxl-language-link" data-bs-toggle="dropdown" data-bs-auto-close="outside">
        <img src="/images/flags/4x3/us.svg" alt="" className="img-fluid wd-20" />
      </div>
      <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-language-dropdown">
        <div className="dropdown-header d-flex align-items-center justify-content-between">
            <h6 className="text-white mb-0">Select Language</h6>
             <span className="avatar-text avatar-md bg-transparent border-0 text-white" data-toggle="tooltip" data-title="Add Language">
              <FiPlus />
            </span>
        </div>
        <div className="language-items-wrapper">
          <div className="row px-4 pt-3">
            {
              headerDropdownLanguagesList.map(({flag, id, language_name}) => {
                return (
                  <div key={id} className="col-sm-4 col-6 language_select">
                    <Link href={"#"} className="d-flex align-items-center gap-2">
                      <div className="avatar-image avatar-sm"><img src={flag} alt="" className="img-fluid" /></div>
                      <span>{language_name}</span>
                    </Link>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default LanguagesModal