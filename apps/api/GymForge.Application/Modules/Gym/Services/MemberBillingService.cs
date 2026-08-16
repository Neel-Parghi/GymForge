using GymForge.Application.Modules.Gym.Interfaces;
using GymForge.Contracts.Gym.Billing;
using GymForge.Domain.Entities;
using GymForge.Domain.Interface;

namespace GymForge.Application.Modules.Gym.Services
{
    public class MemberBillingService : IMemberBillingService
    {

        private readonly IMemberBillingRepository _billingRepository;
        private readonly IUnitOfWork _unitOfWork;

        public MemberBillingService(IMemberBillingRepository billingRepository, IUnitOfWork unitOfWork)
        {
            _billingRepository = billingRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> CreateCustomInvoiceAsync(Guid gymId, Guid? branchId, CreateCustomInvoiceRequest request)
        {
            CustomInvoice invoice = new()
            {
                Id = Guid.NewGuid(),
                GymId = gymId,
                BranchId = branchId,
                MemberId = request.MemberId,
                TrainerId = request.TrainerId,
                BillingType = request.BillingType,
                Description = $"{request.BillingType} Invoice",
                Amount = request.Amount,
                TaxRate = (request.BillingType == "Personal Training" ||
                           request.BillingType == "Rehab & Therapy" ||
                           request.BillingType == "Other Charges") ? 0 : 18,
                PaymentMethod = request.Status == "Pending" ? "Pending-" + request.PaymentMethod : request.PaymentMethod,
                Status = request.Status,
                TransactionDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(15),
                CreatedOn = DateTime.UtcNow
            };

            await _billingRepository.AddCustomInvoiceAsync(invoice);
            int saved = await _unitOfWork.SaveChangesAsync();
            
            return saved > 0;
        }

        public async Task<MemberBillingOverviewDto> GetMemberBillingOverviewAsync(Guid gymId, Guid? branchId, string monthKey)
        {
            int year = int.Parse(monthKey.Split('-')[0]);
            int month = int.Parse(monthKey.Split('-')[1]);

            DateTime startDate = new(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            DateTime endDate = startDate.AddMonths(1).AddTicks(-1);

            List<MemberInvoiceDto> unifiedInvoices = [];

            Branch? mainBranch = await _billingRepository.GetMainBranchAsync(gymId);

            IEnumerable<MemberSubscription> subscriptions = await _billingRepository.GetSubscriptionsByMonthAsync(gymId, startDate, endDate);

            foreach (MemberSubscription sub in subscriptions)
            {
                if (branchId.HasValue && sub.Member.BranchId != branchId.Value) 
                    continue;

                bool isFirstSubscription = !sub.Member.Subscriptions.Any(prev => prev.StartDate < sub.StartDate);
                string billingCategory = isFirstSubscription ? "Registration" : "Membership Renewal";

                Branch? resolvedBranch = sub.Member.Branch ?? mainBranch;

                unifiedInvoices.Add(new MemberInvoiceDto
                {
                    Id = $"GF-{sub.StartDate:yyyy}-{sub.Id.ToString()[..4].ToUpper()}",
                    MemberId = sub.MemberId,
                    MemberName = $"{sub.Member.FirstName} {sub.Member.LastName}",
                    Email = sub.Member.Email,
                    BillingType = billingCategory,
                    Description = sub.PlanNameSnapshot ?? "Membership Plan Access",
                    Amount = sub.PricePaid,
                    DateIssued = sub.StartDate,
                    DueDate = sub.StartDate.AddDays(15),
                    Status = sub.PaymentStatus.ToString(),
                    MembershipNumber = sub.Member.MembershipNumber ?? string.Empty,
                    RealRecordId = sub.Id,
                    CreatedOn = sub.CreatedOn,

                    // Branch scoping details
                    BranchId = resolvedBranch?.Id,
                    BranchName = resolvedBranch?.Name ?? "Main Outlet",
                    BranchLine1 = resolvedBranch?.Address?.Address1 ?? string.Empty,
                    BranchLine2 = resolvedBranch?.Address?.Address2 ?? string.Empty,
                    BranchCity = resolvedBranch?.Address?.City ?? string.Empty,
                    BranchState = resolvedBranch?.Address?.State ?? string.Empty,
                    BranchPostalCode = resolvedBranch?.Address?.PostalCode ?? string.Empty
                });
            }

            IEnumerable<SaleTransaction> retailSales = await _billingRepository.GetTransactionsByMonthAsync(gymId, startDate, endDate);

            foreach (SaleTransaction tx in retailSales)
            {
                if (branchId.HasValue && tx.BranchId != branchId.Value) 
                    continue;

                Branch? resolvedBranch = tx.Branch ?? mainBranch;
                
                unifiedInvoices.Add(new MemberInvoiceDto
                {
                    Id = $"GF-{tx.TransactionDate:yyyy}-{tx.Id.ToString()[..4].ToUpper()}",
                    MemberId = tx.MemberId,
                    MemberName = $"{tx?.Member?.FirstName} {tx?.Member?.LastName}",
                    Email = tx?.Member?.Email ?? "N/A",
                    BillingType = "Store Purchase",
                    Description = tx?.InventoryItem?.Name ?? "Retail Sale Item",
                    Amount = tx?.TotalAmount ?? 0,
                    DateIssued = tx.TransactionDate,
                    DueDate = tx.TransactionDate,
                    Status = tx.PaymentMethod.StartsWith("Pending") ? "Pending" : "Paid",
                    MembershipNumber = tx?.Member?.MembershipNumber ?? string.Empty,
                    RealRecordId = tx.Id,
                    CreatedOn = tx.CreatedOn,

                    BranchId = resolvedBranch?.Id,
                    BranchName = resolvedBranch?.Name ?? "Main Outlet",
                    BranchLine1 = resolvedBranch?.Address?.Address1 ?? string.Empty,
                    BranchLine2 = resolvedBranch?.Address?.Address2 ?? string.Empty,
                    BranchCity = resolvedBranch?.Address?.City ?? string.Empty,
                    BranchState = resolvedBranch?.Address?.State ?? string.Empty,
                    BranchPostalCode = resolvedBranch?.Address?.PostalCode ?? string.Empty
                });
            }

            IEnumerable<CustomInvoice> customInvoices = await _billingRepository.GetCustomInvoicesByMonthAsync(gymId, startDate, endDate);

            foreach (CustomInvoice invoice in customInvoices)
            {
                if (branchId.HasValue && invoice.BranchId != branchId.Value) 
                    continue;

                Branch? resolvedBranch = invoice.Branch ?? mainBranch;

                unifiedInvoices.Add(new MemberInvoiceDto
                {
                    Id = $"GF-{invoice.TransactionDate:yyyy}-{invoice.Id.ToString()[..4].ToUpper()}",
                    MemberId = invoice.MemberId,
                    MemberName = $"{invoice?.Member?.FirstName} {invoice?.Member?.LastName}",
                    Email = invoice?.Member?.Email ?? "N/A",
                    BillingType = invoice?.BillingType ?? string.Empty,
                    Description = invoice?.Description ?? invoice?.BillingType ?? string.Empty,
                    Amount = invoice?.Amount ?? 0,
                    DateIssued = invoice.TransactionDate,
                    DueDate = invoice.DueDate,
                    Status = invoice.PaymentMethod.StartsWith("Pending") ? "Pending" : "Paid",
                    PaymentMethod = invoice.PaymentMethod,
                    MembershipNumber = invoice?.Member?.MembershipNumber ?? string.Empty,
                    RealRecordId = invoice.Id,
                    CreatedOn = invoice.CreatedOn,

                    // Branch scoping details
                    BranchId = resolvedBranch?.Id,
                    BranchName = resolvedBranch?.Name ?? "Main Outlet",
                    BranchLine1 = resolvedBranch?.Address?.Address1 ?? string.Empty,
                    BranchLine2 = resolvedBranch?.Address?.Address2 ?? string.Empty,
                    BranchCity = resolvedBranch?.Address?.City ?? string.Empty,
                    BranchState = resolvedBranch?.Address?.State ?? string.Empty,
                    BranchPostalCode = resolvedBranch?.Address?.PostalCode ?? string.Empty
                });
            }

            List<MemberInvoiceDto> sortedInvoices = [..unifiedInvoices.OrderByDescending(x => x.CreatedOn)];

            decimal totalCollected = sortedInvoices.Where(x => x.Status == "Paid").Sum(x => x.Amount);
            decimal pendingReceivables = sortedInvoices.Where(x => x.Status == "Pending").Sum(x => x.Amount);
            decimal overdueBalances = sortedInvoices.Where(x => x.Status == "Unpaid" || x.Status == "Overdue").Sum(x => x.Amount);

            GymForge.Domain.Entities.Gym? gym = await _billingRepository.GetGymByIdAsync(gymId);

            return new MemberBillingOverviewDto
            {
                Invoices = sortedInvoices,
                Stats = new MemberBillingStatsDto
                {
                    TotalCollected = totalCollected,
                    PendingReceivables = pendingReceivables,
                    OverdueBalances = overdueBalances,
                    TotalInvoiced = totalCollected + pendingReceivables + overdueBalances
                },
                GymName = gym?.GymName ?? string.Empty,
                GymBrandName = gym?.BrandName ?? string.Empty,
                GymGstNumber = gym?.GstNumber ?? string.Empty
            };
        }

        public async Task<bool> MarkAsPaidAsync(Guid gymId, Guid recordId)
        {
            MemberSubscription? subscription = await _billingRepository.GetSubscriptionByIdAsync(recordId);
            if (subscription != null)
            {
                subscription.PaymentStatus = GymForge.Shared.Enums.PaymentStatus.Paid;
                subscription.ModifiedOn = DateTime.UtcNow;
                
                int savedSub = await _unitOfWork.SaveChangesAsync();
                return savedSub > 0;
            }

            SaleTransaction? transaction = await _billingRepository.GetTransactionByIdAsync(recordId);
            if (transaction != null)
            {
                if (transaction.PaymentMethod.StartsWith("Pending-"))
                {
                    transaction.PaymentMethod = transaction.PaymentMethod.Replace("Pending-", "");
                }
                
                int savedTx = await _unitOfWork.SaveChangesAsync();
                return savedTx > 0;
            }

            CustomInvoice? invoice = await _billingRepository.GetCustomInvoiceByIdAsync(recordId);
            if (invoice != null)
            {
                if (invoice.PaymentMethod.StartsWith("Pending-"))
                {
                    invoice.PaymentMethod = invoice.PaymentMethod.Replace("Pending-", "");
                }
                invoice.Status = "Paid";
                invoice.ModifiedOn = DateTime.UtcNow;

                int savedInvoice = await _unitOfWork.SaveChangesAsync();
                return savedInvoice > 0;
            }

            return false;
        }
    }
}
