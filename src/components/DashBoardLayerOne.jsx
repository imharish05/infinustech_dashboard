import React from 'react'
import SalesStatisticOne from './child/SalesStatisticOne';
import LatestRegisteredOne from './child/LatestRegisteredOne';
import UnitCountOne from './child/UnitCountOne';
import HasPermission from "../components/HasPermission"

const DashBoardLayerOne = () => {

    return (
        <>
            {/* UnitCountOne */}
            <UnitCountOne />

            <section className="row gy-4 mt-1">

                {/* SalesStatisticOne */}

                <HasPermission permission={"view-admin"}>

                <SalesStatisticOne />


                {/* LatestRegisteredOne */}
                <LatestRegisteredOne />
                </HasPermission>

            </section>
        </>


    )
}

export default DashBoardLayerOne