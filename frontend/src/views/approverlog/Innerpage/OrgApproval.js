import React, { useEffect, useState } from 'react';
import {
    CButton,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
    CPopover,
    CBadge,
    CNav,
    CNavItem,
    CNavLink
} from '@coreui/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
const OrgApproval = () => {


    const [latestOrg, setlatestOrg] = useState([]);
    const [approvalname, setapprovalname] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState(null); // State to store selected organization
    const [approvedOrgs, setapprovedOrgs] = useState([])
    const uniquevalue = "OrgButton";
    const location = useLocation();
    const { state } = location;
    const navigate = useNavigate();
    const [isshown, setIsShown] = useState(['organization']);


    useEffect(() => {
        setSelectedOrg(state);
    }, []);

    const fetchlatestOrg = async () => {
        try {
            const response = await axios.get('http://localhost:5000/getlatestorg', {
                params: {
                    orgname: localStorage.getItem('orgname'),
                    orgcode: localStorage.getItem('orgcode'),
                },
            });
            setlatestOrg(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchApproverThatHaveUniqueValue = async () => {
        try {
            const response = await axios.get('http://localhost:5000/getapproverthathaveuniquevalue', {
                params: {
                    orgname: localStorage.getItem('orgname'),
                    orgcode: localStorage.getItem('orgcode'),
                    uniquevalue: uniquevalue,
                },
            });
            setapprovalname(response.data);

        } catch (error) {
            console.log(error);
        }
    };


    async function checker() {
        try {
            const response = await axios.get('http://localhost:5000/getapprovedorg', {
                params: {
                    orgname: localStorage.getItem('orgname'),
                    orgcode: localStorage.getItem('orgcode'),
                    uniquevalue: uniquevalue
                },
            });

            setapprovedOrgs(response.data);

        } catch (error) {
            console.error(error);
        }
    }


    const [allorg, setallorg] = useState([]);
    async function getOrganizations() {
        try {
            const response = await axios.get(`http://localhost:5000/getorg`, {
                params: {
                    orgname: localStorage.getItem('orgname'),
                    orgcode: localStorage.getItem('orgcode')
                }
            })
            setallorg(response.data)
        } catch (error) {
            console.log(error);
        }
    }



    useEffect(() => {
        Promise.all([fetchApproverThatHaveUniqueValue(), fetchlatestOrg()])
            .then(() => checker())
            .then(() => getOrganizations())
            .catch((error) => console.error(error));
    }, []);



    const openModal = (org) => {
        setSelectedOrg(org);
    }

    const closeModal = () => {
        setSelectedOrg(null);
    }

    const handleInputChange = (e, field) => {
        setSelectedOrg({
            ...selectedOrg,
            [field]: e.target.value
        });
    }


    const approveOrganization = async () => {
        try {
            const response = await axios.put('http://localhost:5000/approveOrganization', {
                orgId: selectedOrg.id,
                updatedFields: selectedOrg,
                approval: { username: localStorage.getItem('username'), status: 'Approve' }
            });

            toast.success('Organization approved successfully');
            closeModal();
            checker();
            // const updatedLatestOrg = latestOrg.filter(org => {
            //     // Check if the organization has any approval with status 'Reject'
            //     const hasRejected = org.approval.some(approval => approval.status === 'Reject');
            //     // Check if the organization's clientname is not equal to the selectedOrg's clientname
            //     const isNotSelectedOrg = org.clientname !== selectedOrg.clientname;
            //     // Include the organization in the filtered array if it hasn't been rejected and is not the selectedOrg
            //     return !hasRejected && isNotSelectedOrg;
            // });
            // setlatestOrg(updatedLatestOrg);
            const updatedLatestOrg = latestOrg.filter(org => org.clientname !== selectedOrg.clientname);
            setlatestOrg(updatedLatestOrg);
            navigate(location.pathname, { replace: true })
        } catch (error) {
            console.log(error);
            toast.error('Failed to approve organization');
        }
    }

    const rejectOrg = async () => {
        try {
            const response = await axios.put('http://localhost:5000/approveOrganization', {
                orgId: selectedOrg.id,
                updatedFields: selectedOrg,
                approval: { username: localStorage.getItem('username'), status: 'Reject' }
            });
            toast.success('Organization rejected successfully');
            closeModal();
            checker();

            const updatedLatestOrg = latestOrg.filter(org => org.clientname !== selectedOrg.clientname);
            setlatestOrg(updatedLatestOrg);
            navigate(location.pathname, { replace: true })
        } catch (error) {
            console.log(error);
            toast.error('Failed to Reject organization');
        }
    }


    useEffect(() => {
        navigate('/approverlog', { state: null })
    }, [])


    function reverse(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth is zero-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }



    return (
        <div>
            <h1>Approver Log of Organization</h1>
            <CTable striped hover responsive>
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell>Date</CTableHeaderCell>
                        <CTableHeaderCell>Task Name</CTableHeaderCell>
                        <CTableHeaderCell>Created By</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>

                    {
                        localStorage.getItem('username') !== 'admin' ? (
                            approvalname?.some(item => item.employeename === localStorage.getItem('username')) ? (
                                latestOrg && latestOrg.map((org, index) => {
                                    // Check if allorg is null or if the organization is not present in the allorg array
                                    if (!allorg || !allorg.some(approvedOrg => approvedOrg.clientname === org.clientname)) {
                                        // Check if the org has the approval array and if it contains the current user's username
                                        if (!org.approval || !org.approval.some(approval => approval.username === localStorage.getItem('username'))) {
                                            const hasRejected = org.approval && org.approval.some(approval => approval.status === 'Reject');
                                            if (!hasRejected) {
                                                return (
                                                    <CTableRow key={index}>
                                                        <CTableDataCell>{reverse(org.createdon)}</CTableDataCell>
                                                        <CTableDataCell>{org.clientname}</CTableDataCell>
                                                        <CTableDataCell>{org.username}</CTableDataCell>
                                                        <CTableDataCell>
                                                            <CPopover content="Show Details of Organization" trigger={['hover', 'focus']}>
                                                                <CButton color="primary" onClick={() => openModal(org)}>Show More</CButton>
                                                            </CPopover>
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                );
                                            }
                                        } else {
                                            return null; // Skip rendering the row if the organization is present in allorg or if it has the current user's approval
                                        }
                                    } else {
                                        return null; // Skip rendering the row if the organization is present in allorg
                                    }
                                })
                            ) : (
                                <p>You do not have permission for approval.</p>
                            )
                        ) : (
                            latestOrg && latestOrg.map((org, index) => {
                                const isPresent = allorg?.some(row => row.clientname === org.clientname);
                                const rejct = org.approval?.some(item => item.status === 'Reject');
                                // Set the status based on the conditions
                                const status = isPresent ? 'Completed' : (rejct ? 'Rejected' : 'Pending');

                                return (
                                    <CTableRow key={index}>
                                        <CTableDataCell>{reverse(org.createdon)}</CTableDataCell>
                                        <CTableDataCell>{org.clientname}</CTableDataCell>
                                        <CTableDataCell>{org.username}</CTableDataCell>
                                        <CTableDataCell>{status}</CTableDataCell>
                                    </CTableRow>
                                );
                            })
                        )
                    }

                </CTableBody>

            </CTable>

            <CModal
                visible={selectedOrg !== null}
                onClose={closeModal}
                aria-labelledby="LiveDemoExampleLabel"
                size='lg'
            >
                <CModalHeader onClose={closeModal}>
                    <CModalTitle id="LiveDemoExampleLabel">
                        All Data
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {selectedOrg && (
                        <>

                            <div className='orgapprovalmodal'>
                                <CModalTitle className='modaltitleorgapproval'>Organization Details</CModalTitle>

                                <label>Organization Name</label>
                                <input type="text" value={selectedOrg.clientname} onChange={(e) => handleInputChange(e, 'clientname')} />

                                <label className='branchnameorgapprovalmodal'>Branch Name</label>
                                <input type="text" value={selectedOrg.branchname} onChange={(e) => handleInputChange(e, 'branchname')} />
                            </div>

                            <div>
                                <CModalTitle className='modaltitleorgapproval'>Address Details</CModalTitle>
                                <label className='addresslabeltorgapprovalmodal'>Address</label>
                                <input className='addressinputorgapprovalmodal' type="text" value={selectedOrg.address} onChange={(e) => handleInputChange(e, 'address')} />
                            </div>
                            <div className='orgapprovalmodal-1'>
                                <label className='addresslabelorgapprovalmodal'>City</label>
                                <input type="text" value={selectedOrg.city} onChange={(e) => handleInputChange(e, 'city')} />

                                <label className='addresslabelorgapprovalmodal-1'>State</label>
                                <input className='addresslabelorgapprovalmodal-2' type="text" value={selectedOrg.state} onChange={(e) => handleInputChange(e, 'state')} />
                            </div>
                            <div className='orgapprovalmodal-1'>
                                <label className='addresslabelorgapprovalmodal'>Country</label>
                                <input className='addresslabelorgapprovalmodal-2' type="text" value={selectedOrg.country} onChange={(e) => handleInputChange(e, 'country')} />

                                <label className='addresslabelorgapprovalmodal-1'>PostalCode</label>
                                <input className='addresslabelorgapprovalmodal-2' type="text" value={selectedOrg.postalcode} onChange={(e) => handleInputChange(e, 'postalcode')} />
                            </div>

                            <CModalTitle className='modaltitleorgapproval'>Registration Details</CModalTitle>
                            <div className='registrationorgarpproval'>
                                <label><h6>GST</h6></label>
                                <input type="text" value={selectedOrg.GST} onChange={(e) => handleInputChange(e, 'GST')} />

                                <label className='registrationorgarpproval-1'><h6>IEC</h6></label>
                                <input type="text" value={selectedOrg.IEC} onChange={(e) => handleInputChange(e, 'IEC')} />

                                <label className='registrationorgarpproval-1'><h6>PAN</h6></label>
                                <input type="text" value={selectedOrg.PAN} onChange={(e) => handleInputChange(e, 'PAN')} />

                            </div>

                            <div>
                                <CModalTitle className='modaltitleorgapproval'>Account Details</CModalTitle>

                                <label className='accountorgapproval'><h6>Credit Days</h6></label>
                                <input type="text" value={selectedOrg.creditdays} onChange={(e) => handleInputChange(e, 'creditdays')} />
                            </div>

                            <CModalTitle className='modaltitleorgapproval'>Contact Details</CModalTitle>
                            <div>
                                <label className='contactorgapprovalmodal'><h6>Phone</h6></label>
                                <input className='contactorgapprovalmodal' type="text" value={selectedOrg.phone} onChange={(e) => handleInputChange(e, 'phone')} />

                                <label><h6>Email</h6></label>
                                <input className='contactorgapprovalmodal-1' type="text" value={selectedOrg.email} onChange={(e) => handleInputChange(e, 'email')} />
                            </div>
                            <div>
                                <CModalTitle className='modaltitleorgapproval'>Created By</CModalTitle>
                                <label><h6>Username</h6></label>
                                <input className='contactorgapprovalmodal-1' type="text" value={selectedOrg.username} onChange={(e) => handleInputChange(e, 'username')} />
                            </div>
                        </>
                    )}
                </CModalBody>

                <CModalFooter>
                    <CPopover content="Close Modal" trigger={['hover', 'focus']}>
                        <CButton color="secondary" onClick={closeModal}>
                            Close
                        </CButton>
                    </CPopover>
                    <CPopover content="Approve Organization" trigger={['hover', 'focus']}>
                        <CButton color="primary" onClick={approveOrganization}>
                            Approve
                        </CButton>
                    </CPopover>
                    <CPopover content="Reject Organization" trigger={['hover', 'focus']}>
                        <CButton color="danger" onClick={rejectOrg}>
                            Reject
                        </CButton>
                    </CPopover>
                </CModalFooter>
            </CModal>
        </div>
    )
}

export default OrgApproval
