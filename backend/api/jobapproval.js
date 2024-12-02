import { connectMySQL } from "../config/sqlconfig.js";
import { broadcast } from '../websocketServer.js'
const connection = await connectMySQL();
import moment from 'moment';
export const getapproverofJobs = async (orgname, orgcode, uniquevalue, branchcode) => {
    try {
        const [rows] = await connection.execute(`SELECT * FROM approvername WHERE orgname = ? AND orgcode = ? AND branchcode = ?`, [orgname, orgcode, branchcode]);
        const matchingRows = rows.filter(row => row.uniquevalue.includes(uniquevalue));
        return matchingRows;
    } catch (error) {
        console.log(error);
    }
}


export const getJob = async (orgname, orgcode) => {
    try {
        const [rows] = await connection.execute(`SELECT * FROM approvalimpjob WHERE orgname = ? AND orgcode = ?`, [orgname, orgcode]);
        return rows;
    } catch (error) {
        console.log(error);
    }
}



export const approveImpJob = async (jobId, GST, IEC, address, benumber, betype, blstatus, bltype, bltypenum, branchcode, branchname,
    cfsname, consignmenttype, customhouse, deliverymode, finaldestination, freedays, importername, jobdate, jobnumber, jobowner, noofcontainer, orgname,
    orgcode, ownbooking, owntransportation, portofshipment, shippinglinebond, shippinglinename, transportmode, username, status) => {
    try {
        console.log(status);
        const [row] = await connection.execute(`
            UPDATE approvalimpjob 
            SET address = ?, benumber = ?, betype = ?, blstatus = ?, bltype = ?, bltypenum = ?, 
            cfsname = ?, consignmenttype = ?, customhouse = ?, deliverymode = ?, finaldestination = ?, 
            freedays = ?, noofcontainer = ?, 
            ownbooking = ?, owntransportation = ?, portofshipment = ?, 
            shippinglinebond = ?, shippinglinename = ?, transportmode = ?
            WHERE orgname = ? AND orgcode = ? AND id = ? AND branchname = ? AND branchcode = ? AND jobnumber = ?
        `, [address, benumber, betype, blstatus, bltype, bltypenum,
            cfsname, consignmenttype, customhouse, deliverymode, finaldestination, freedays,
            noofcontainer, ownbooking, owntransportation, portofshipment, shippinglinebond, shippinglinename,
            transportmode, orgname, orgcode, jobId, branchname, branchcode, jobnumber]);

        const [approvalrow] = await connection.execute(`SELECT approval FROM approvalimpjob WHERE orgname = ? AND orgcode = ? AND jobnumber = ?`, [orgname, orgcode, jobnumber]);

        const approval = approvalrow[0].approval;
        const updatedApproval = approval.map((item) => {
            if (item.employeename === username) {
                item.status = status;
            }
            return item; // Return the modified item
        });

        const [updateRow] = await connection.execute(`UPDATE approvalimpjob SET approval = ? WHERE orgname = ? AND orgcode = ? AND jobnumber = ?`, [JSON.stringify(updatedApproval), orgname, orgcode, jobnumber]);

        const [approvalrownotification] = await connection.execute(`SELECT * FROM impnotifications WHERE orgname = ? AND orgcode = ? AND jobnumber = ? AND branchname = ? AND branchcode = ?`, 
            [orgname, orgcode, jobnumber, branchname, branchcode]
        )

        if (approvalrownotification.length === 0) {
            throw new Error('No matching record found.');
        }
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const tobeupdated = approvalrownotification[0];

        const updatingarray = await tobeupdated.reading.map((row) => {
            if (row.employeename === username) {
                if(status === 'Approve'){
                    return { ...row, approved: 1, read: 1 };
                }else if(status === 'Reject'){
                    return { ...row, approved: -1, read: 1 };
                }
            }
            return row;
        })
        
        const updatedTime = await tobeupdated.timeofreading.map((row) => {
            if (row.employeename === username) {
                return { ...row, time: currentTime };
            }
            return row; // Return the original object if the condition is not met
        });


        await connection.execute(
            `UPDATE impnotifications SET reading = ?, timeofreading = ? WHERE orgname = ? AND orgcode = ? AND branchname = ? AND jobnumber = ? AND branchcode = ?`,
            [
                updatingarray,
                updatedTime,
                orgname,
                orgcode,
                branchname,
                jobnumber,
                branchcode
            ]
        );

        return row;
    } catch (error) {
        console.log(error);
    }
}



export const ApprovalJobMainLogic = async (orgname, orgcode, uniquevalue) => {
    try {

        const [rows] = await connection.execute(`SELECT * FROM approvalimpjob WHERE orgname = ? AND orgcode = ?`, [orgname, orgcode]);
        const [lengthrows] = await connection.execute(`SELECT * FROM approvername WHERE orgname = ? AND orgcode = ?`, [orgname, orgcode]);
        const [mattrows] = await connection.execute(`SELECT * FROM approverlist WHERE orgname = ? AND orgcode = ?`, [orgname, orgcode]);

        const matchingRows = lengthrows.filter(row => row.uniquevalue.includes(uniquevalue));
        const matchingRows2 = mattrows.filter(row => row.uniquevalue[0] === uniquevalue);

        const approvedJobs = rows.filter((row) => {
            if (row.approval !== null) {
                if (matchingRows2[0].selectedcount > 0) {
                    const approvals = JSON.stringify(row.approval) // Assuming 'approval' column stores JSON string
                    const approvalrow = JSON.parse(approvals)
                    const approvedCount = approvalrow.filter(item => item.status === 'Approve').length;
                    const isAllApproved = approvedCount === matchingRows2[0].selectedcount;
                    // const isAllApproved = approvalrow.every((item) => item.status === 'Approve');
                    return isAllApproved;
                } else if (row.approval.length == matchingRows.length) {
                    const approvals = JSON.stringify(row.approval) // Assuming 'approval' column stores JSON string
                    const approvalrow = JSON.parse(approvals)
                    const isAllApproved = approvalrow.every((item) => item.status === 'Approve');
                    return isAllApproved;
                }
            }
        })

        for (const job of approvedJobs) {
            const [existingJob] = await connection.execute(`SELECT * FROM impjobcreation WHERE orgname = ? AND orgcode = ? AND jobnumber = ?`, [orgname, orgcode, job.jobnumber]);
            if (existingJob.length === 0) {

                await connection.execute(`INSERT INTO impjobcreation (jobnumber, jobdate, docreceivedon, transportmode, customhouse,
                    ownbooking, deliverymode, noofcontainer, owntransportation, betype, consignmenttype, cfsname, shippinglinename, bltype, 
                    bltypenum, orgname, orgcode, jobowner, freedays, blstatus, benumber, shippinglinebond, count, branchname, branchcode)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [job.jobnumber, job.jobdate, job.docreceivedon, job.transportmode,
                job.customhouse, job.ownbooking, job.deliverymode, job.noofcontainer, job.owntransportation, job.betype, job.consignmenttype,
                job.cfsname, job.shippinglinename, job.bltype, job.bltypenum, orgname, orgcode, job.jobowner,
                job.freedays, job.blstatus, job.benumber, job.shippinglinebond, job.count, job.branchname, job.branchcode]);

                await connection.execute(`INSERT INTO impgeneral (importername, address, GST, IEC, finaldestination, portofshipment,
                    orgname, orgcode, jobowner, jobnumber, branchname, branchnameofjob, branchcodeofjob
                )
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, [job.importername, job.address, job.GST, job.IEC,
                job.finaldestination, job.portofshipment, orgname, orgcode, job.jobowner, job.jobnumber, job.importerbranchname, job.branchname, job.branchcode]);

                const [employees] = await connection.execute(`SELECT * FROM employees WHERE orgname = ? AND orgcode = ?`, [orgname, orgcode]);

                employees.forEach(employee => {
                    broadcast({
                        username: employee.username,
                        type: 'new_job',
                        message: `A new job ${job.jobnumber} has been added.`
                    });
                });

            }
        }

        return approvedJobs;

    } catch (error) {
        console.log(error);
    }
}


export const getAllJobsofImp = async (orgname, orgcode) => {
    try {
        const [rows] = await connection.execute(`SELECT * FROM impjobcreation WHERE orgname = ? AND orgcode = ?`, [orgname, orgcode]);
        return rows;
    } catch (error) {
        console.log(error);
    }
}
